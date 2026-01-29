import { BlogQueryInput } from "../routers/inputTypes/blog-query-input";
import { BlogMongoModel } from "../BLL/dto/blog-mongo-model";
import { WithId } from "mongodb";
import { blogsCollection } from "../../db/mongo.db";

export const blogsQueryRepository = {
  async findMany(
    queryInput: BlogQueryInput,
  ): Promise<{ items: WithId<BlogMongoModel>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } = queryInput;
    const skip: number = (pageNumber - 1) * pageSize;
    const filter: any = {};

    if (searchNameTerm) {
      filter["name"] = { $regex: searchNameTerm, $options: "i" };
    }

    const items = await blogsCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await blogsCollection.countDocuments(filter);
    return { items, totalCount};
  },
};

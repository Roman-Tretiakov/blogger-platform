import { WithId } from "mongodb";
import { postsCollection } from "../../db/mongo.db";
import { PostMongoModel } from "../BLL/dto/post-mongo-model";
import { PostQueryInput } from "../routers/inputTypes/post-query-input";

export const postsQueryRepository = {
  async findMany(
    queryInput: PostQueryInput,
  ): Promise<{ items: WithId<PostMongoModel>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      queryInput;
    const skip: number = (pageNumber - 1) * pageSize;
    const filter: any = {};

    if (searchNameTerm) {
      filter["name"] = { $regex: searchNameTerm, $options: "i" };
    }

    const items = await postsCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await postsCollection.countDocuments(filter);
    return { items, totalCount };
  },
};

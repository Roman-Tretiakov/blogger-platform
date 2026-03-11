import { BlogQueryInput } from "../routers/inputTypes/blog-query-input";
import { Collection, ObjectId } from "mongodb";
import { NotFoundError } from "../../core/errorClasses/NotFoundError";
import { BlogViewModel } from "../BLL/dto/blog-view-model-type";
import { mapToBlogViewModel } from "../mappers/map-to-blog-view-model";
import { BlogListWithPagination } from "../routers/outputTypes/blog-list-with-pagination";
import { BlogMongoModel } from "../BLL/dto/blog-mongo-model";

export class BlogsQueryRepository {
  constructor(private collection: Collection<BlogMongoModel>) {}

  async getBlogById(id: string): Promise<BlogViewModel> {
    const blog = await this.collection.findOne({ _id: new ObjectId(id) });
    if (blog === null) {
      throw new NotFoundError(`Blog with id: ${id} not found`, "id");
    }
    return mapToBlogViewModel(blog);
  }

  async findMany(queryInput: BlogQueryInput): Promise<BlogListWithPagination> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      queryInput;
    const skip: number = (pageNumber - 1) * pageSize;
    const filter: any = {};

    if (searchNameTerm) {
      filter["name"] = { $regex: searchNameTerm, $options: "i" };
    }

    const items = await this.collection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await this.collection.countDocuments(filter);
    return {
      page: queryInput.pageNumber,
      pageSize: queryInput.pageSize,
      pagesCount: Math.ceil(totalCount / queryInput.pageSize),
      totalCount: totalCount,
      items: items.map(mapToBlogViewModel),
    };
  }
}

import { CommentMongoModel } from "./types/comment-mongo-model";
import { commentsCollection } from "../../db/mongo.db";
import { Result } from "../../core/types/result-object-type";
import { ResultStatus } from "../../core/enums/result-statuses";

export const commentsRepository = {
  async create(inputModel: CommentMongoModel): Promise<Result<string | null>> {
    const result = await commentsCollection.insertOne(inputModel);
    return {
      status: result.acknowledged ? ResultStatus.Created : ResultStatus.Failure,
      errorMessage: result.acknowledged ? "" : "Internal server error during comment creating",
      extensions: [],
      data: result.acknowledged ? result.insertedId.toString() : null
    };
  },
};
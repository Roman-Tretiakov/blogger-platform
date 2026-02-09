import { CommentMongoModel } from "./types/comment-mongo-model";
import { commentsCollection } from "../../db/mongo.db";
import { Result } from "../../core/types/result-object-type";
import { ResultStatus } from "../../core/enums/result-statuses";
import { ObjectId } from "mongodb";
import { CommentInputModel } from "../routers/inputTypes/comment-input-model";

export const commentsRepository = {
  async create(inputModel: CommentMongoModel): Promise<Result<string | null>> {
    const result = await commentsCollection.insertOne(inputModel);
    return {
      status: result.acknowledged ? ResultStatus.Created : ResultStatus.Failure,
      errorMessage: result.acknowledged
        ? ""
        : "Internal server error during comment creating",
      extensions: [],
      data: result.acknowledged ? result.insertedId.toString() : null,
    };
  },

  async delete(commentId: string): Promise<Result> {
    const result = await commentsCollection.deleteOne({
      _id: new ObjectId(commentId),
    });
    return {
      status: result.acknowledged
        ? ResultStatus.Success
        : ResultStatus.NotFound,
      errorMessage: result.acknowledged ? "" : "Comment with this id not found",
      extensions: [],
      data: null,
    };
  },

  async update(
    commentId: string,
    inputModel: CommentInputModel,
  ): Promise<Result> {
    const result = await commentsCollection.updateOne(
      { _id: new ObjectId(commentId) },
      { $set: inputModel },
    );
    return {
      status:
        result.matchedCount < 1 ? ResultStatus.NotFound : ResultStatus.Success,
      errorMessage:
        result.matchedCount < 1 ? "Comment with this id not found" : "",
      extensions: [],
      data: null
    };
  },
};

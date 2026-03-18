import { CommentMongoModel } from "./types/comment-mongo-model";
import { Result } from "../../core/types/result-object-type";
import { ResultStatus } from "../../core/enums/result-statuses";
import { DeleteResult, ObjectId } from "mongodb";
import { CommentInputModel } from "../routers/inputTypes/comment-input-model";
import { injectable } from "inversify";
import { CommentModel } from "./schemas/comment.schema";
import { UpdateWriteOpResult } from "mongoose";

@injectable()
export class CommentsRepository {
  async create(inputModel: CommentMongoModel): Promise<Result<string | null>> {
    const result = await CommentModel.create(inputModel);
    return {
      status: result ? ResultStatus.Created : ResultStatus.Failure,
      errorMessage: result
        ? ""
        : "Internal server error during comment creating",
      extensions: [],
      data: result ? result._id.toString() : null,
    };
  }

  async delete(commentId: string): Promise<Result> {
    const result: DeleteResult = await CommentModel.deleteOne({
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
  }

  async update(
    commentId: string,
    inputModel: CommentInputModel,
  ): Promise<Result> {
    const result: UpdateWriteOpResult = await CommentModel.updateOne(
      { _id: new ObjectId(commentId) },
      { $set: inputModel },
    );
    return {
      status:
        result.matchedCount < 1 ? ResultStatus.NotFound : ResultStatus.Success,
      errorMessage:
        result.matchedCount < 1 ? "Comment with this id not found" : "",
      extensions: [],
      data: null,
    };
  }

  async clear(): Promise<void> {
    await CommentModel.deleteMany({});
  }
}

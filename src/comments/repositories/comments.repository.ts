import { CommentMongoModel } from "./types/comment-mongo-model";
import { Result } from "../../core/types/result-object-type";
import { ResultStatus } from "../../core/enums/result-statuses";
import { CommentInputModel } from "../routers/inputTypes/comment-input-model";
import { injectable } from "inversify";
import { CommentModel, LeanComment } from "./schemas/comment.schema";

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
    const result =
      await CommentModel.findByIdAndDelete(commentId).lean<LeanComment>();
    return {
      status: result ? ResultStatus.Success : ResultStatus.NotFound,
      errorMessage: result ? "" : "Comment with this id not found",
      extensions: [],
      data: null,
    };
  }

  async update(
    commentId: string,
    inputModel: CommentInputModel,
  ): Promise<Result> {
    const result = await CommentModel.findByIdAndUpdate(commentId, {
      $set: inputModel,
    }).lean<LeanComment>();
    return {
      status: !result ? ResultStatus.NotFound : ResultStatus.Success,
      errorMessage: !result ? "Comment with this id not found" : "",
      extensions: [],
      data: null,
    };
  }

  async clear(): Promise<void> {
    await CommentModel.deleteMany({});
  }
}

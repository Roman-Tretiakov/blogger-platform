import { CommentMongoModel } from "./types/comment-mongo-model";
import { Result } from "../../core/types/result-object-type";
import { ResultStatus } from "../../core/enums/result-statuses";
import { CommentInputModel } from "../routers/inputTypes/comment-input-model";
import { injectable } from "inversify";
import { CommentModel, LeanComment } from "./schemas/comment.schema";

@injectable()
export class CommentsRepository {
  async create(inputModel: CommentMongoModel): Promise<Result<string | null>> {
    const comment = await new CommentModel(inputModel).save();
    const result = !!comment._id;

    return {
      status: result ? ResultStatus.Created : ResultStatus.Failure,
      errorMessage: result
        ? ""
        : "Internal server error during comment creating",
      extensions: [],
      data: result ? comment.id : null,
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

  async update(commentId: string, content: CommentInputModel): Promise<Result> {
    const result = await CommentModel.findByIdAndUpdate(commentId, {
      $set: content,
    }).lean<LeanComment>();
    return {
      status: !result ? ResultStatus.NotFound : ResultStatus.Success,
      errorMessage: !result ? "Comment with this id not found" : "",
      extensions: [],
      data: null,
    };
  }

  // Атомарное изменение счётчиков
  async updateLikesCount(
    commentId: string,
    likesIncrement: number, // +1, -1 или 0
    dislikesIncrement: number,
  ): Promise<void> {
    await CommentModel.updateOne(
      { _id: commentId },
      {
        $inc: {
          "likesInfo.likesCount": likesIncrement,
          "likesInfo.dislikesCount": dislikesIncrement,
        },
      },
    );
  }

  async clear(): Promise<void> {
    await CommentModel.deleteMany({});
  }
}

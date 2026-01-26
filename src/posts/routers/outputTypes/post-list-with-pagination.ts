import { Paginator } from "../../../core/types/paginator";
import { PostViewModel } from "../../BLL/dto/post-view-model-type";

export type PostListWithPagination = Paginator<PostViewModel[]>;
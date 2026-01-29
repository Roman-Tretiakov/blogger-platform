import { Paginator } from "../../../core/types/paginator";
import { BlogViewModel } from "../../../blogs/BLL/dto/blog-view-model-type";

export type UserListWithPagination = Paginator<BlogViewModel[]>;
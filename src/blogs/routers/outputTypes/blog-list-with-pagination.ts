import { BlogViewModel } from "../../BLL/dto/blog-view-model-type";
import { Paginator } from "../../../core/types/paginator";

export type BlogListWithPagination = Paginator<BlogViewModel[]>;
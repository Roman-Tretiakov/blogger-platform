import { Paginator } from "../../../core/types/paginator";
import { UserViewModel } from "../../types/outputTypes/user-view-model";

export type UserListWithPagination = Paginator<UserViewModel[]>;
export type CommentViewModel = {
    id: string;
    postId?: string;
    content: string;
    commentatorInfo: {
        userId: string;
        userLogin: string;
    };
    createdAt: string;
}
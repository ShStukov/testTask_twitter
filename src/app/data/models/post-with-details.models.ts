import { Post } from "./post.model";

export interface PostWithDetails extends Post {
    authorName: string,
    commentCount: number
}
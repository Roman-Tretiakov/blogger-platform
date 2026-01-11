import { db } from "../../../db/db";
import VideoModel from "../../types/video-model-type";
import { PostInputModel } from "../dto/post-input-dto";

export const postsRepository = {
  findAll(): VideoModel[] {
    return db.videos;
  },

  findById(id: number): VideoModel | null {
    return db.videos.find((video: VideoModel) => video.id === id) ?? null;
  },

  create(video: VideoModel): VideoModel {
    db.videos.push(video);
    return video;
  },

  update(id: number, updateModel: UpdateVideoInputModel): void {
    const video: VideoModel | undefined = db.videos.find(
      (video: VideoModel) => video.id === id,
    );

    if (!video) {
      throw new Error(`Video with id ${id} not found`);
    }

    db.videos[id] = Object.assign(video, updateModel);
  },

  delete(id: number): void {
    const index = db.videos.findIndex((video: VideoModel) => video.id === id);

    if (index === -1) {
      throw new Error(`Video with id ${id} not found`);
    }

    db.videos.splice(index, 1);
  },
  clear(): void {
    db.posts = [];
  },
};

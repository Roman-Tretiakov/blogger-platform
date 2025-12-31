import request from 'supertest';
import express from 'express';
import {setupApp} from '../../src/setup-app';
import {CreateVideoInputModel, UpdateVideoInputModel} from '../../src/core/videos/dto/video-input-dto';
import {HttpStatus} from "../../src/core/enums/http-status";
import {RouterList} from "../../src/core/constants/router-list";

describe('Video API tests', () => {
    const app = express();
    setupApp(app);

    const createdVideo: CreateVideoInputModel = {
        title: "Test Video",
        author: "Test Author",
        availableResolutions: ["P144", "P240"]
    };
    const updatedVideo: UpdateVideoInputModel = {
        title: "Updated Test Video",
        author: "Updated Test Author",
        availableResolutions: ["P360", "P480"],
        canBeDownloaded: true,
        minAgeRestriction: 18,
        publicationDate: new Date().toISOString()
    };

    beforeAll(async () => {
        const res = await request(app).delete(RouterList.TEST_DELETE_ALL_VIDEOS);
        expect(res.status).toBe(HttpStatus.NoContent)
        expect(res.body).toEqual({});
    });

    test("should create video; POST /videos", async () => {
        const newVideo: CreateVideoInputModel = {
            ...createdVideo
        };
        await request(app)
            .post(RouterList.ALL_VIDEOS)
            .send(newVideo)
            .expect(HttpStatus.Created);
    });

    test("should return videos list; GET /videos", async () => {
        const createdVideo2: CreateVideoInputModel = {
            title: "Test Video 2",
            author: "Test Author 2",
            availableResolutions: ["P144", "P240", "P360"]
        };

        const createdVideo3: CreateVideoInputModel = {
            title: "Test Video 3",
            author: "Test Author 3",
            availableResolutions: ["P144", "P240", "P360", "P480", "P720", "P1080", "P1440", "P2160"]
        };

        await request(app)
            .post(RouterList.ALL_VIDEOS)
            .send({...createdVideo2})
            .expect(HttpStatus.Created);

        await request(app)
            .post(RouterList.ALL_VIDEOS)
            .send({...createdVideo3})
            .expect(HttpStatus.Created);

        const videoListResponse = await request(app)
            .get(RouterList.ALL_VIDEOS)
            .expect(HttpStatus.Ok);

        expect(videoListResponse.body).toBeInstanceOf(Array);
        expect(videoListResponse.body.length).toEqual(3);
    });

    test("should return video by id; GET /video/:id", async () => {
        const createdVideo4: CreateVideoInputModel = {
            title: "Test Video 4",
            author: "Test Author 4",
            availableResolutions: ["P144", "P240", "P360", "P480", "P720", "P1080", "P1440", "P2160"]
        };

        const createResponse = await request(app)
            .post(RouterList.ALL_VIDEOS)
            .send({...createdVideo4})
            .expect(HttpStatus.Created);

        const getResponse = await request(app)
            .get(RouterList.ALL_VIDEOS + "/" + createResponse.body.id)
            .expect(HttpStatus.Ok);

        expect(getResponse.body).toEqual({
            ...createResponse.body,
            id: expect.any(Number),
            createdAt: expect.any(String),
        });
    });

    test("should update video by id; PUT /video/:id", async () => {
        const createdVideo5: CreateVideoInputModel = {
            title: "Test Video 5",
            author: "Test Author 5",
            availableResolutions: ["P144", "P240", "P360", "P480", "P720", "P1080", "P1440", "P2160"]
        };

        const createResponse = await request(app)
            .post(RouterList.ALL_VIDEOS)
            .send({...createdVideo5})
            .expect(HttpStatus.Created);

        const newData: UpdateVideoInputModel = {
            title: "Updated Test Video 5",
            author: "Updated Test Author 5",
            availableResolutions: ["P360", "P480"],
            canBeDownloaded: true,
            minAgeRestriction: 6,
            publicationDate: new Date().toISOString()
        };

        const updateResponse = await request(app)
            .put(RouterList.ALL_VIDEOS + "/" + createResponse.body.id)
            .send({...newData})
            .expect(HttpStatus.Ok);

        expect(updateResponse.body).toEqual({
            ...createResponse.body,
            ...newData
        });
    });

    test("should delete video by id; DELETE /video/:id", async () => {
        const createdVideo6: CreateVideoInputModel = {
            title: "Test Video 6",
            author: "Test Author 6",
            availableResolutions: ["P144", "P1440", "P2160"]
        };
        const createResponse = await request(app)
            .post(RouterList.ALL_VIDEOS)
            .send({...createdVideo6})
            .expect(HttpStatus.Created);
        const id: number = createResponse.body.id;

        await request(app)
            .delete(RouterList.ALL_VIDEOS + "/" + id)
            .expect(HttpStatus.Ok);

        await request(app)
            .get(RouterList.ALL_VIDEOS + "/" + id)
            .expect(HttpStatus.NotFound);
    })
});
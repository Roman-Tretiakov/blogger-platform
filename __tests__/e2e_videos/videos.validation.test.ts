import express from "express";
import request from "supertest";
import {setupApp} from "../../src/setup-app";
import {EndpointList} from "../../src/core/constants/endpoint-list";
import {HttpStatus} from "../../src/core/enums/http-status";
import {AvailableResolutions} from "../../src/core/enums/available-resolutions";
import {CreateVideoInputModel, UpdateVideoInputModel} from "../../src/core/videos/dto/video-input-dto";
import {ErrorNames} from "../../src/core/enums/error-names";

describe('Video API body validation test', () => {
    const app = express();
    setupApp(app);

    const validCreateDataSet: CreateVideoInputModel = {
        title: "Video_1",
        author: "Agata Kristi",
        availableResolutions: [AvailableResolutions.P144, AvailableResolutions.P240],
    }
    const validUpdateDataSet: UpdateVideoInputModel = {
        title: "Video_1",
        author: "Agata Kristi",
        canBeDownloaded: true,
        minAgeRestriction: null,
        publicationDate: "2024-01-20T15:30:45.123Z",
        availableResolutions: [AvailableResolutions.P144, AvailableResolutions.P360, AvailableResolutions.P2160],
    }

    beforeAll(async () => {
        const res = await request(app).delete("/testing" + EndpointList.TEST_DELETE_ALL_VIDEOS);
        expect(res.status).toBe(HttpStatus.NoContent)
        expect(res.body).toEqual({});
    });

    //Valid data set validation test for Create Video
    test("Create Video has no errors; POST /videos", async () => {
        const createResponse = await request(app)
            .post(EndpointList.ALL_VIDEOS)
            .send({...validCreateDataSet})
            .expect(HttpStatus.Created);
        expect(createResponse.body.errorMessages).toBeUndefined();
    });

    //Valid data set validation test for Update Video
    test("Update Video has no errors; PUT /video/:id", async () => {
        const createResponse = await request(app)
            .post(EndpointList.ALL_VIDEOS)
            .send({...validCreateDataSet})
            .expect(HttpStatus.Created);
        const updateResponse = await request(app)
            .put(EndpointList.ALL_VIDEOS + "/" + createResponse.body.id)
            .send({...validUpdateDataSet})
            .expect(HttpStatus.Ok);
        expect(updateResponse.body.errorMessages).toBeUndefined();
    });

    //Invalid data set validation test 1 for Create Video
    test("Create Video without title; POST /videos", async () => {
        const createResponse = await request(app)
            .post(EndpointList.ALL_VIDEOS)
            .send({
                ...validCreateDataSet,
                title: undefined,
            })
            .expect(HttpStatus.BadRequest);
        const errorMessages: string[] = createResponse.body.errorMessages?.map((err: {field: string, message: string}) => err.message) ?? [];

        expect(errorMessages).toHaveLength(1);
        expect(errorMessages).toContain(ErrorNames.TITLE_MISSING_ERROR);
    });

    //Invalid data set validation test 1-1 for Create Video
    test("Create Video with invalid title length; POST /videos", async () => {
        const createResponse = await request(app)
            .post(EndpointList.ALL_VIDEOS)
            .send({
                ...validCreateDataSet,
                title: "a",
            })
            .expect(HttpStatus.BadRequest);
        const errorMessages: string[] = createResponse.body.errorMessages?.map((err: {field: string, message: string}) => err.message) ?? [];

        expect(errorMessages).toHaveLength(1);
        expect(errorMessages).toContain(ErrorNames.TITLE_LENGTH_ERROR);
    });

    //Invalid data set validation test 2 for Create Video
    test("Create Video with invalid param; POST /videos", async () => {
        const createResponse = await request(app)
            .post(EndpointList.ALL_VIDEOS)
            .send({
                ...validCreateDataSet,
                author: 1,
            })
            .expect(HttpStatus.BadRequest);
        const errorMessages: string[] = createResponse.body.errorMessages?.map((err: {field: string, message: string}) => err.message) ?? [];

        expect(errorMessages).toHaveLength(1);
        expect(errorMessages).toContain(ErrorNames.AUTHOR_TYPE_ERROR);
    });

    //Invalid data set validation test 2-1 for Create Video
    test("Create Video with invalid length; POST /videos", async () => {
        const createResponse = await request(app)
            .post(EndpointList.ALL_VIDEOS)
            .send({
                ...validCreateDataSet,
                author: "ABCDEFGHIJKLMNOPQRST1",
            })
            .expect(HttpStatus.BadRequest);
        const errorMessages: string[] = createResponse.body.errorMessages?.map((err: {field: string, message: string}) => err.message) ?? [];

        expect(errorMessages).toHaveLength(1);
        expect(errorMessages).toContain(ErrorNames.AUTHOR_LENGTH_ERROR);
    });

    //Invalid data set validation test 2-2 for Create Video
    test("Create Video with valid length; POST /videos", async () => {
        const createResponse = await request(app)
            .post(EndpointList.ALL_VIDEOS)
            .send({
                ...validCreateDataSet,
                author: "AB",
            })
            .expect(HttpStatus.Created);
        const errorMessages: string[] = createResponse.body.errorMessages?.map((err: {field: string, message: string}) => err.message) ?? [];

        expect(errorMessages).toHaveLength(0);
    });

    //Invalid data set validation test 3 for Create Video
    test("Create Video with invalid availableResolutions length & values; POST /videos", async () => {
        const createResponse = await request(app)
            .post(EndpointList.ALL_VIDEOS)
            .send({
                ...validCreateDataSet,
                availableResolutions: ["P144", "P240", "P360", "P481", "P720", "P1080", "P1440", "P2160", "P2860"],
            })
            .expect(HttpStatus.BadRequest);
        const errorMessages: string[] = createResponse.body.errorMessages?.map((err: {field: string, message: string}) => err.message) ?? [];

        expect(errorMessages).toHaveLength(2);
        expect(errorMessages).toContain(ErrorNames.AVAILABLE_RESOLUTIONS_LENGTH_ERROR);
        expect(errorMessages).toContain(ErrorNames.AVAILABLE_RESOLUTIONS_VALUE_ERROR + "P481");
    });

    //Invalid data set validation test 3-1 for Create Video
    test("Create Video with not array availableResolutions values; POST /videos", async () => {
        const createResponse = await request(app)
            .post(EndpointList.ALL_VIDEOS)
            .send({
                ...validCreateDataSet,
                availableResolutions: "P144",
            })
            .expect(HttpStatus.BadRequest);
        const errorMessages: string[] = createResponse.body.errorMessages?.map((err: {field: string, message: string}) => err.message) ?? [];

        expect(errorMessages).toHaveLength(1);
        expect(errorMessages).toContain(ErrorNames.AVAILABLE_RESOLUTIONS_TYPE_ERROR);
    });

    //Invalid data set validation test 4 for Update Video
    test("Invalid publicationDate format; PUT /video/:id", async () => {
        const createResponse = await request(app)
            .post(EndpointList.ALL_VIDEOS)
            .send({...validCreateDataSet})
            .expect(HttpStatus.Created);
        const updateResponse = await request(app)
            .put(EndpointList.ALL_VIDEOS + "/" + createResponse.body.id)
            .send({
                ...validUpdateDataSet,
                publicationDate: "01/2024",
            })
            .expect(HttpStatus.BadRequest);
        const errorMessages: string[] = updateResponse.body.errorMessages?.map((err: {field: string, message: string}) => err.message) ?? [];

        expect(errorMessages).toHaveLength(1);
        expect(errorMessages).toContain(ErrorNames.PUBLICATION_DATE_FORMAT_ERROR);
    });
});
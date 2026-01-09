import request from "supertest";
import {HttpStatus} from "../../src/core/enums/http-status";
import {EndpointList} from "../../src/core/constants/endpoint-list";
import express from "express";
import {setupApp} from "../../src/setup-app";

describe("GET /", () => {
    const app = express();
    setupApp(app);

    test("GET / should return 'Welcome to Video Hosting Service API!'", async () => {
        const res = await request(app).get(EndpointList.SLASH_PATH);
        expect(res.status).toBe(HttpStatus.Ok);
        expect(res.text).toBe("Welcome to Video Hosting Service API!");
    });
});
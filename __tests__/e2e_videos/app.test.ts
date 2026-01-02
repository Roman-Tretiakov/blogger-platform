import request from "supertest";
import { app } from "../../src";
import {HttpStatus} from "../../src/core/enums/http-status";
import {EndpointList} from "../../src/core/constants/endpoint-list";

describe("GET /", () => {
    it("GET / should return 'Welcome to Video Hosting Service API!'", async () => {
        const res = await request(app).get(EndpointList.SLASH_ROUTE);
        expect(res.status).toBe(HttpStatus.Ok);
        expect(res.text).toBe("Welcome to Video Hosting Service API!");
    });
});
import request from "supertest";
import { app } from "../../src/index";
import {HttpStatus} from "../../src/core/enums/http-status";
import {RouterList} from "../../src/core/constants/router-list";

describe("GET /", () => {
    it("GET / should return 'Welcome to Video Hosting Service API!'", async () => {
        const res = await request(app).get(RouterList.SLASH_ROUTE);
        expect(res.status).toBe(HttpStatus.Ok);
        expect(res.text).toBe("Welcome to Video Hosting Service API!");
    });
});
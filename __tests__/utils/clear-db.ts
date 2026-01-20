import request from "supertest";
import { EndpointList } from "../../src/core/constants/endpoint-list";
import { HttpStatus } from "../../src/core/enums/http-status";
import { Express } from "express";

export async function clearDB(app: Express) {
  await request(app)
    .delete(EndpointList.TEST_DELETE_ALL)
    .expect(HttpStatus.NoContent);
  return;
}

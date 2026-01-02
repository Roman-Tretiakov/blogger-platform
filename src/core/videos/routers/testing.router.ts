import {Router} from "express";
import {db} from "../../../db/db";
import {HttpStatus} from "../../enums/http-status";
import {EndpointList} from "../../constants/endpoint-list";

export const testingRouter = Router({});

testingRouter.delete(EndpointList.TEST_DELETE_ALL_VIDEOS, (req, res) => {
    db.videos = [];
    res.status(HttpStatus.NoContent).send(db.videos);
});
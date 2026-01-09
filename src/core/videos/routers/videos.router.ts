import {Router} from "express";
import {EndpointList} from "../../constants/endpoint-list";
import {getVideoListHandler} from "./handlers/get-video-list.handler";
import {getVideoHandler} from "./handlers/get-video.handler";
import {postVideoHandler} from "./handlers/post-video.handler";
import {putVideoHandler} from "./handlers/put-video.handler";
import {deleteVideoHandler} from "./handlers/delete-video.handler";
import {inputValidationResultMiddleware} from "../../middlewares/input-validation-result.middleware";
import {createVideoBodyValidationMiddleware} from "../middlewares/create-video-body-validation-middleware";
import {paramIdValidationMiddleware} from "../../middlewares/params-id-validation.middleware";
import {updateVideoBodyValidationMiddleware} from "../middlewares/update-video-body-validation-middleware";

export const videosRouter = Router({});

videosRouter
// videos crud routes:
.get(EndpointList.EMPTY_PATH, getVideoListHandler)
.get(EndpointList.SINGLE_VIDEO, paramIdValidationMiddleware, inputValidationResultMiddleware, getVideoHandler) // сюда добавляем мидлвэры на валидацию перед обработчиками
.post(EndpointList.EMPTY_PATH, createVideoBodyValidationMiddleware, inputValidationResultMiddleware, postVideoHandler) // сюда добавляем мидлвэры на валидацию перед обработчиками
.put(EndpointList.SINGLE_VIDEO, paramIdValidationMiddleware, createVideoBodyValidationMiddleware, updateVideoBodyValidationMiddleware, inputValidationResultMiddleware, putVideoHandler) // сюда добавляем мидлвэры на валидацию перед обработчиками
.delete(EndpointList.SINGLE_VIDEO, paramIdValidationMiddleware, inputValidationResultMiddleware, deleteVideoHandler); // сюда добавляем мидлвэры на валидацию перед обработчиками


// Что такое middleware?
//     Middleware (или промежуточные обработчики) — это функции, которые выполняются между получением запроса сервером и отправкой ответа клиенту. Они могут:
//
//     Изменять объект запроса (req) и ответа (res).
//     Прерывать выполнение запроса и отправлять ответ (res.send()).
//     Передавать управление следующему обработчику с помощью next().
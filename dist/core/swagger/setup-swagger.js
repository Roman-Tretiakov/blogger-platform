"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Video hosting API',
            version: '1.0.0',
            description: 'video API',
        },
        // servers: [
        //     {
        //         url: 'https://first-express-app-two.vercel.app',
        //         description: 'Production server',
        //     },
        // ],
    },
    apis: ['./src/core/videos/docs/*.swagger.yml', './src/**/*.swagger.yml'],
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
const setupSwagger = (app) => {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
};
exports.setupSwagger = setupSwagger;

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Video hosting API',
            version: '1.0.0',
            description: 'video API',
        },
    },
    apis: ['./src/**/*.swagger.yml'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
    app.use('/api', swaggerUi.serve);
    app.get('/api', swaggerUi.setup(swaggerSpec, {
        customJs: "/api/swagger-ui-bundle.js",
        customCssUrl: "/api/swagger-ui.css",
    }));
};
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
        // servers: [
        //     {
        //         url: 'https://first-express-app-two.vercel.app',
        //         description: 'Production server',
        //     },
        // ],
    },
    apis: ['./src/core/videos/docs/*.swagger.yml', './src/**/*.swagger.yml'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import { join } from "node:path";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blogger platform API",
      version: "1.0.0",
      description: "Open API",
    },
    tags: [
      { name: "Blogs", description: "API for managing blogs" },
      { name: "Posts", description: "API for managing posts" },
      { name: "Testing", description: "API for clearing the database" },
      { name: "Users", description: "API for managing users" },
      { name: "Comments", description: "API for managing comments" },
      { name: "Auth", description: "API for authorization" },
    ],
    components: {
      securitySchemes: {
        basicAuth: {
          type: "http",
          scheme: "basic",
          description: "Base64 encoded username and password",
        },
      },
    },
    security: [{ basicAuth: [] }],
  },
  apis: [
    join(__dirname, "../../blogs/docs/blogs.swagger.yml"),
    join(__dirname, "../../posts/docs/posts.swagger.yml"),
    join(__dirname, "../../testing/docs/testing.swagger.yml"),
    join(__dirname, "../../users/docs/users.swagger.yml"),
    join(__dirname, "../../comments/docs/comments.swagger.yml"),
    join(__dirname, "../../auth/docs/auth.swagger.yml"),
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
  app.use("/api", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

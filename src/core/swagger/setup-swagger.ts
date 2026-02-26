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
      { name: "Auth", description: "API for authorization" },
      { name: "Blogs", description: "API for managing blogs" },
      { name: "Posts", description: "API for managing posts" },
      { name: "Testing", description: "API for clearing the database" },
      { name: "Users", description: "API for managing users" },
      { name: "Comments", description: "API for managing comments" },
    ],
    components: {
      securitySchemes: {
        basicAuth: {
          type: "http",
          scheme: "basic",
          description: "Base64 encoded username and password",
        },
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT Bearer token for access token",
        },
        refreshToken: {
          type: "apiKey",
          in: "cookie",
          name: "refreshToken",
          description:
            "JWT refresh token in http-only cookie. Токен должен быть валидным и не истекшим.",
        },
      },
    },
    // Убираем глобальную security, так как разные эндпоинты используют разные схемы
    security: [],
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
  // Настройка Swagger UI с поддержкой credentials
  app.use(
    "/api",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        withCredentials: true, // РАЗРЕШАЕМ отправку cookies
        requestInterceptor: (request: any) => {
          // Добавляем credentials: 'include' к каждому запросу
          request.credentials = "include";

          // Логирование для отладки (можно убрать после настройки)
          console.log("Swagger Request:", {
            url: request.url,
            method: request.method,
            hasCookie: !!document.cookie,
          });

          return request;
        },
        responseInterceptor: (response: any) => {
          // Логирование ответов (опционально)
          return response;
        },
      },
      // Кастомизация интерфейса
      customSiteTitle: "Blogger Platform API Documentation",
      customCss: ".swagger-ui .topbar { display: none }",
      customfavIcon: "/favicon.ico",
    }),
  );

  // Добавляем маршрут для получения openapi.json (полезно для отладки)
  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};

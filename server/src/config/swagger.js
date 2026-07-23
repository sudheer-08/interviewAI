import swaggerJSDoc from "swagger-jsdoc";

const version = process.env.npm_package_version || "1.0.0";

const swaggerDefinition = {
    openapi: "3.0.3",
    info: {
        title: "Interview AI API",
        version,
        description: "Production API documentation for Interview AI backend",
    },
    servers: [
        {
            url: "/api/v1",
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
            },
        },
        schemas: {
            ApiResponse: {
                type: "object",
                properties: {
                    statusCode: { type: "integer" },
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: { nullable: true },
                },
            },
        },
    },
};

const swaggerOptions = {
    definition: swaggerDefinition,
    apis: ["server/src/app.js", "server/src/routes/*.js", "server/src/controllers/*.js"],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
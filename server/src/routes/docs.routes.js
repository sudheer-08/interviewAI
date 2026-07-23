import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "../config/swagger.js";

const router = Router();

router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

export default router;
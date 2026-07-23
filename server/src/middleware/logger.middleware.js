import morgan from "morgan";

const loggerMiddleware = morgan("combined");

export default loggerMiddleware;
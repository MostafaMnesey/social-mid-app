"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//third-party middlewares
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const morgan_1 = __importDefault(require("morgan"));
//express & types
const express_1 = __importDefault(require("express"));
const social_app_swagger_json_1 = __importDefault(require("../Docs/social_app_swagger.json"));
//core
const path_1 = require("path");
//controllers
const auth_controller_1 = __importDefault(require("./Modules/Auth/auth.controller"));
const user_controller_1 = __importDefault(require("./Modules/User/user.controller"));
const error_response_1 = require("./utils/error.response");
const Connection_db_1 = __importDefault(require("./DB/Connection.db"));
//configurations & constants
(0, dotenv_1.config)({ path: (0, path_1.resolve)("./config/.env.development") });
//rate limiter
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    message: {
        error: "Too many requests from this IP, please try again after 15 minutes",
    },
});
//bootstrap function starting point of the app
const bootstrap = async () => {
    //port number
    const port = /* process.env.PORT || */ 3001;
    //express app
    const app = (0, express_1.default)();
    //Third-party-middlewares
    app.use(express_1.default.json(), (0, cors_1.default)(), (0, helmet_1.default)(), (0, morgan_1.default)("dev"), limiter);
    //Application routes
    app.use("/auth", auth_controller_1.default);
    app.use("/user", user_controller_1.default);
    // swagger docs
    app.use("/api", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(social_app_swagger_json_1.default));
    // invalid route
    app.use("{/*dummy}", (req, res) => {
        return res.status(404).json({ error: "Invalid route" });
    });
    //db connection
    await (0, Connection_db_1.default)();
    // error handler
    app.use(error_response_1.globalErrorHandler);
    //server listening
    app.listen(port, () => {
        console.log(`Server is running on port ${port} 🚀`);
    });
};
exports.default = bootstrap;

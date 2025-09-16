"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const DBRepository_1 = require("./DBRepository");
const error_response_1 = require("../../utils/error.response");
class UserRepository extends DBRepository_1.DBRepository {
    model;
    constructor(model) {
        super(model);
        this.model = model;
    }
    async createUser({ data, options }) {
        const user = (await this.create({ data, options })) || [];
        if (!user) {
            throw new error_response_1.BadRequestException("User creation failed");
        }
        return user;
    }
}
exports.UserRepository = UserRepository;

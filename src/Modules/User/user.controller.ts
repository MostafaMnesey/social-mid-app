import { TokenType } from './../../utils/Types/Enums';
import { Router } from "express";
import userService from "./user.service";
import { authentication, authorization } from "../../Middlewares/authentication";
import { endpoint } from "./user.authraization";
const router: Router = Router();

router.get("/profile", authorization(endpoint.profile), userService.profile);
router.get("/refresh-token",authentication(TokenType.refresh) ,userService.refreshToken);

export default router;

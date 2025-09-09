import { Router } from "express";
import AuthService from "./auth.service";
import { validation } from "../../Middlewares/validation.middleware";
import * as validators from "./auth.validation";

import { authentication } from "../../Middlewares/authentication";
const router: Router = Router();
router.post("/signup", validation(validators.signup),  AuthService.signup);
router.patch("/Confirm-Email", validation(validators.ConfirmEmail), AuthService.ConfirmEmail);
router.post("/login", AuthService.login);
router.get("/user", authentication() ,AuthService.user);

export default router;

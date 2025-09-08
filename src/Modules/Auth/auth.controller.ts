import { Router } from "express";
import AuthService from "./auth.service";
import { validation } from "../../Middlewares/validation.middleware";
import * as validators from "./auth.validation";
import { log } from "console";
const router: Router = Router();
router.post("/signup", validation(validators.signup), AuthService.signup);
router.patch("/Confirm-Email", validation(validators.ConfirmEmail), AuthService.ConfirmEmail);
router.post("/login", AuthService.login);

export default router;

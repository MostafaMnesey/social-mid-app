import { TokenType } from "./../../utils/Types/Enums";
import { Router } from "express";
import userService from "./user.service";
import {
  authentication,
  authorization,
} from "../../Middlewares/authentication";
import { endpoint } from "./user.authraization";
import {
  cloudFileUpload,
  fileValidation,
} from "../../utils/Multer/cloud.multer";
import { StorageEnum } from "./../../utils/Types/Enums";
const router: Router = Router();

router.get("/profile", authorization(endpoint.profile), userService.profile);
router.get(
  "/refresh-token",
  authentication(TokenType.refresh),
  userService.refreshToken
);
router.patch(
  "/profile",
  authentication(),
  cloudFileUpload({
    validation: fileValidation.image,
    storageType: StorageEnum.disk,
  }).single("image"),
  userService.profileImage
);

export default router;

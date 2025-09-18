import { validation } from "./../../Middlewares/validation.middleware";
import multer, { FileFilterCallback } from "multer";
import { StorageEnum } from "../../utils/Types/Enums";
import { BadRequestException } from "../error.response";
import type { Request } from "express";

export const fileValidation = {
  image: ["image/jpeg", "image/png", "image/jpg", "image/gif"],
};
export const cloudFileUpload = ({
  storageType = StorageEnum.memory,
  validation = [],
  maxSize = 5,
}: {
  maxSize?: number;
  storageType?: StorageEnum;
  validation?: string[];
}): multer.Multer => {
  const storage =
    storageType === StorageEnum.memory
      ? multer.memoryStorage()
      : multer.diskStorage({});

  function fileFilter(
    req: Request,
    file: Express.Multer.File,
    callBcak: FileFilterCallback
  ) {
    if (!validation.includes(file.mimetype)) {
      return callBcak(
        new BadRequestException("Invalid file type", {
          validationErrors: [
            {
              key: "file",
              errors: [
                {
                  message: "Invalid File",
                  path: "file",
                },
              ],
            },
          ],
        })
      );
    }
    return callBcak(null, true);
  }

  return multer({
    fileFilter,
    storage,
    limits: { fileSize: maxSize * 1024 * 1024 },
  });
};

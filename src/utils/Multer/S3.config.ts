import { Bucket } from "./../../../node_modules/@aws-sdk/client-s3/dist-types/ts3.4/models/models_0.d";
import {
  BucketCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { StorageEnum } from "../Types/Enums";
import { createReadStream } from "fs";
import { BadRequestException } from "../error.response";
import { v4 as uuid } from "uuid";
export const uploadFile = async ({
  storageType = StorageEnum.memory,
  Bucket = process.env.AWS_S3_BUCKET as string,
  ACL = "private",
  path = "general",
  file,
}: {
  storageType?: StorageEnum;
  Bucket?: string;
  ACL?: BucketCannedACL;
  path?: string;
  file: Express.Multer.File;
}) => {
  console.log(file);

  const command = new PutObjectCommand({
    Bucket,
    ACL,
    Key: `${process.env.APP_NAME}/${path}/${file.originalname}/${uuid()}`,
    Body:
      storageType === StorageEnum.memory
        ? file.buffer
        : createReadStream(file.path),
    ContentType: file.mimetype,
  });
  await s3Client().send(command);
  console.log(command);

  if (!command?.input.Key) {
    throw new BadRequestException("File upload failed");
  }
  return command?.input.Key;
};

export const s3Client = () => {
  return new S3Client({
    region: process.env.AWS_REGION as string,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });
};

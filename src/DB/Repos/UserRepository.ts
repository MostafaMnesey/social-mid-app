import { CreateOptions, HydratedDocument, Model } from "mongoose";
import { IUser as TDoc } from "../../utils/Types/interfaces";
import { DBRepository } from "./DBRepository";
import { BadRequestException } from "../../utils/error.response";

export class UserRepository extends DBRepository<TDoc> {
  constructor(protected override readonly model: Model<TDoc>) {
    super(model);
  }

  async createUser(
  {  data ,
    options}:{
      data: Partial<TDoc>[];
      options?: CreateOptions ;
    }
  ): Promise<HydratedDocument<TDoc>[] | undefined> {
    const user = (await this.create({ data, options })) || [];
    if (!user) {
      throw new BadRequestException("User creation failed");
    }
    return user;
  }
}

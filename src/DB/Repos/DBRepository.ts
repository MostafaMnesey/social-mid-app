import { fi } from "zod/v4/locales/index.cjs";
import {
  CreateOptions,
  FlattenMaps,
  HydratedDocument,
  Model,
  MongooseUpdateQueryOptions,
  PopulateOptions,
  ProjectionType,
  QueryOptions,
  QueryWithHelpers,
  RootFilterQuery,
  UpdateQuery,
  UpdateWriteOpResult,
} from "mongoose";
import { BadRequestException } from "../../utils/error.response";
import { promises } from "dns";

type lea<T> = HydratedDocument<FlattenMaps<T>>;
export abstract class DBRepository<TDoc> {
  constructor(protected readonly model: Model<TDoc>) {}

  async create({
    data,
    options,
  }: {
    data: Partial<TDoc>[];
    options?: CreateOptions | undefined;
  }): Promise<HydratedDocument<TDoc>[] | undefined> {
    return await this.model.create(data, options);
  }

  async findOne({
    filter,
    select,
    options,
  }: {
    filter?: RootFilterQuery<TDoc>;
    select?: ProjectionType<TDoc> | null;
    options?: QueryOptions<TDoc> | null;
  }): Promise<lea<TDoc> | HydratedDocument<TDoc> | null> {
    const doc = this.model.findOne(filter).select(select || "");
    if (options?.populate) {
      doc.populate(options.populate as PopulateOptions[]);
    }
    if (options?.lean) {
      doc.lean(options.lean);
    }

    return await doc.exec();
  }

  async updateOne({
    filter,
    update,
    options,
  }: {
    filter: RootFilterQuery<TDoc>;
    update: UpdateQuery<TDoc>;
    options?: MongooseUpdateQueryOptions<TDoc> | null;
  }): Promise<UpdateWriteOpResult> {
    return await this.model.updateOne(
      filter,
      { ...update, $inc: { __v: 1 } },
      options
    );
  }
}

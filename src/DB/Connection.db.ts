import { connect } from "mongoose";
import UserModel from "./models/user";
const DbConnection = async (): Promise<void> => {
  try {
    const result = await connect(process.env.MONGO_URL as string);
    UserModel.syncIndexes();
    console.log("DB connected successfully✅");
    console.log(result.models);
  } catch (error) {
    console.log("Error in DB connection❌");
  }
};

export default DbConnection;

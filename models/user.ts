import mongoose, { Schema, Document, Model } from "mongoose";
const bcrypt = require("bcrypt");
import { configType } from "../@types";
const config: configType = require("../utils/config");

interface IUser extends Document {
  _id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: string;
}

const userSchema: Schema<IUser> = new mongoose.Schema({
  username: { type: String, required: true, name: "username" },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["admin", "client"], required: true },
});

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

userSchema.pre("save", async function () {
  const user: IUser = this;
  const saltRounds = config.SALT_ROUNDS;
  const hash: string = await bcrypt.hash(user.passwordHash, saltRounds);
  user.passwordHash = hash;
});

userSchema.index({ username: 1 }, { unique: true, name: "username" });

const UserModel: Model<IUser> = mongoose.model("User", userSchema);

export default UserModel;

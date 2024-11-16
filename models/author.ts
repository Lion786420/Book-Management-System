import mongoose, { Schema, Document } from "mongoose";

interface IAuthor extends Document {
  _id: string;
  name: string;
  age: number;
}

const authorSchema: Schema = new Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
});

authorSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const AuthorModel = mongoose.model<IAuthor>("Author", authorSchema);

export default AuthorModel;
export { IAuthor };

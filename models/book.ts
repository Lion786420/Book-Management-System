import mongoose, { Schema, Document, Model } from "mongoose";
import { IAuthor } from "./author.ts";

interface IBook extends Document {
  _id: string;
  title: string;
  author: IAuthor["id"];
  purchased?: number;
}

const bookSchema: Schema<IBook> = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "Author", required: true },
  purchased: { type: Number },
});

bookSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const BookModel: Model<IBook> = mongoose.model<IBook>("Book", bookSchema);

export default BookModel;
export { IBook };

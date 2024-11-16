import mongoose, { Schema, Document, Model } from "mongoose";
import { IBook } from "./book";
import { IGenre } from "./genre";

interface IBookGenre extends Document {
  bookId: IBook["id"];
  genreId: IGenre["id"];
}

const bookGenreSchema: Schema<IBookGenre> = new mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  genreId: { type: mongoose.Schema.Types.ObjectId, ref: "Genre" },
});

bookGenreSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const BookGenreModel: Model<IBookGenre> = mongoose.model(
  "BookGenre",
  bookGenreSchema
);

export default BookGenreModel;

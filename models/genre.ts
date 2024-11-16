import mongoose, { Schema, Document, Model } from "mongoose";

interface IGenre extends Document {
  _id: string;
  genre: string;
  popularity?: number;
}

const genreSchema: Schema<IGenre> = new mongoose.Schema({
  genre: { type: String, required: true },
  popularity: Number,
});

genreSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const GenreModel: Model<IGenre> = mongoose.model("Genre", genreSchema);

export default GenreModel;
export { IGenre };

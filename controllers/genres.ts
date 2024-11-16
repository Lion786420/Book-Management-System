import GenreModel from "../models/genre";
import BookGenreModel from "../models/bookGenre";
import jwt from "jsonwebtoken";
import config from "../utils/config";
import { Router, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";

const genresRouter = Router();

const tokenExtractor = (req: Request, res: Response) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  } else {
    res.send({ error: "Bearer token not found" }).end();
  }
};

genresRouter.get("/", async (req: Request, res: Response) => {
  const bookGenres = await GenreModel.aggregate([
    {
      $lookup: {
        from: "bookgenres",
        localField: "_id",
        foreignField: "genreId",
        as: "genreInfo",
      },
    },
    {
      $project: {
        _id: 1,
        genre: 1,
        totalBooks: { $size: "$genreInfo" },
      },
    },
    {
      $sort: { totalBooks: -1 },
    },
  ]);
  res.json(bookGenres);
});

genresRouter.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const genreName = await GenreModel.findById(req.params.id);
  if (!genreName) {
    res.send({ error: "Cannot find genre with given name" });
    return;
  }
  const genre = await BookGenreModel.find(
    { genreId: req.params.id },
    { bookId: 1 }
  ).populate("bookId", { title: 1 });
  if (!genre) {
    res.send({ error: "Cannot find genre with given id" });
    return;
  }

  res.json({ genre: genreName!.genre, ...genre, totalBooks: genre.length });
});

genresRouter.post("/", async (req: Request, res: Response, next) => {
  try {
    const token: string | undefined = tokenExtractor(req, res);
    const tokenDecrypt: JwtPayload = jwt.verify(token, config.SECRET);

    if (tokenDecrypt.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Only admin role can insert new data" });
    }

    const body: { genre: string; popularity: number } = req.body;
    const newGenre = new GenreModel({
      genre: body.genre.toLowerCase(),
      popularity: body.popularity,
    });

    const createdGenre = await newGenre.save();
    return res.status(201).json(createdGenre);
  } catch (err) {
    next(err);
  }
});

export default genresRouter;

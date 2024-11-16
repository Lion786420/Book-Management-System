import { Router, Request, Response } from "express";
const booksRouter = Router();
import GenreModel from "../models/genre";
import BookModel from "../models/book";
import AuthorModel from "../models/author";
import BookGenreModel from "../models/bookGenre";
import { BookGenreType, configType, genreType } from "../@types";
import { auth } from "../utils/middleware";
const config: configType = require("../utils/config.ts");
const middleware = require("../utils/middleware");

const tokenExtractor = (res: Request, response: Response) => {
  const authorization: string | undefined = res.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  } else {
    response.send({ error: "Bearer token not found" }).end();
  }
};

booksRouter.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const id: string = req.params.id;
  const findGenre = await BookGenreModel.find({
    bookId: id,
  }).populate("genreId");
  const genreArray = findGenre.map((book) => book.genreId.genre);
  console.log(genreArray);
  const requiredBook = await BookGenreModel.findOne(
    { bookId: id },
    { bookId: 1 }
  )
    .populate("bookId")
    .lean();

  if (requiredBook) {
    res.json({ ...requiredBook, genres: genreArray });
  } else {
    res.status(401).send({ error: "No book with given id found" }).end();
  }
});

booksRouter.get(
  "/",
  async (req: Request, res: Response, next): Promise<void> => {
    try {
      let { page, size, skip } = req.query;
      let pageNumber: number = page ? parseInt(page as string, 10) : 1;
      let sizeNumber: number = size ? parseInt(size as string, 10) : 10;
      let skipNumber: number = skip ? parseInt(skip as string, 10) : 0;
      if (isNaN(pageNumber)) pageNumber = 1;
      if (isNaN(sizeNumber)) sizeNumber = 10;

      const book = await BookGenreModel.find({})
        .populate("genreId", {
          genre: 1,
          popularity: 1,
        })
        .populate("bookId", { title: 1, author: 1 })
        .sort({ id: 1 })
        .skip(skipNumber)
        .limit(sizeNumber);

      res.send({
        page,
        size,
        books: book,
      });
    } catch (error) {
      res.sendStatus(500);
    }
  }
);

booksRouter.post(
  "/",
  tokenExtractor,
  auth,
  async (req: Request, res: Response, next): Promise<void> => {
    try {
      const { title, author, genres } = req.body;

      if (!title || !author || !genres) {
        res.status(400).json({ error: "Please provide a valid book" });
      }

      let authorId = null;
      const checkAuthor = await AuthorModel.findOne({ name: author });
      if (checkAuthor) {
        authorId = checkAuthor.id;
      }

      const genreArray: Array<string> = [];
      for (const each of genres) {
        const checkGenre = await GenreModel.findOne({
          genre: each.toLowerCase(),
        });
        if (!checkGenre) {
          res.status(400).json({ error: "Genre invalid" });
        }
        genreArray.push(checkGenre!.id);
      }

      const newBook = new BookModel({
        title,
        author: authorId,
        purchased: 0,
      });
      const savedBook = await newBook.save();

      for (const genreId of genreArray) {
        const newBookGenre = new BookGenreModel({
          bookId: savedBook.id,
          genreId: genreId,
        });
        await newBookGenre.save();
      }

      res.status(201).json(savedBook);
    } catch (err) {
      next(err);
    }
  }
);

booksRouter.delete("/:id", async (req: Request, res: Response, next) => {
  const deleteId = req.params.id;
  const check = await BookModel.findById(deleteId);
  if (check) {
    await BookModel.findByIdAndDelete(deleteId);
    res.status(204).end();
  }
});

booksRouter.put("/purchase/:id", async (req: Request, res: Response, next) => {
  const bookId = req.params.id;
  const saveBook = await BookModel.findByIdAndUpdate(
    bookId,
    { $inc: { purchased: 1 } },
    {
      new: true,
    }
  );
  res.send(saveBook);
});

export default booksRouter;

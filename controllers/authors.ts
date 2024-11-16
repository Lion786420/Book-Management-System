import { configType, authorType, bookType, JwtPayload } from "../@types";
import { Request, Response } from "express";
import { Router } from "express";

const authorsRouter = Router();
import AuthorModel from "../models/author";
import BookModel from "../models/book";
import jwt from "jsonwebtoken";
import genresRouter from "./genres";
const config: configType = require("../utils/config.ts");

const tokenExtractor = (res: Request, response: Response) => {
  const authorization: string | undefined = res.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    return authorization.replace("Bearer ", "");
  } else {
    response.send({ error: "Bearer token not found" }).end();
  }
};

authorsRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  const allAuthors: Array<authorType> = await AuthorModel.find({});
  res.json(allAuthors);
});

authorsRouter.get(
  "/:id",
  async (req: Request, res: Response): Promise<void> => {
    const author: authorType | null = await AuthorModel.findById(
      req.params.id
    ).lean();
    const authorBooks: bookType[] | null = await BookModel.find({
      author: req.params.id,
    });
    const books: string[] = authorBooks.map((book) => book.title);
    res.json({ ...author, books });
  }
);

authorsRouter.post(
  "/",
  async (req: Request, res: Response, next): Promise<void> => {
    try {
      const token: string = tokenExtractor(req, res)!;
      const tokenDecrypt = jwt.verify(token, config.SECRET);
      if (tokenDecrypt.role !== "admin") {
        res.status(403).json({ error: "Only admin role can insert new data" });
      }

      const { name, age } = req.body;
      if (!name || !age) {
        res
          .status(400)
          .json({ error: "Please provide valid name and age for author" });
      }

      const newAuthor = new AuthorModel({ name, age });
      const saved = await newAuthor.save();

      res.status(201).json(saved);
    } catch (error) {
      next(error);
    }
  }
);

export default genresRouter;

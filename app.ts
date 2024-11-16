import booksRouter from "./controllers/books";
import mongoose from "mongoose";
import express from "express";
import { configType } from "./@types";
const config: configType = require("./utils/config");
import genresRouter from "./controllers/genres";
import authorsRouter from "./controllers/genres";
import usersRouter from "./controllers/users";
import loginRouter from "./controllers/login";
import { errorHandler, requestLogger } from "./utils/middleware";

const app = express();

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error: Error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.use(express.json());
app.use(requestLogger);

app.use("/api/users", usersRouter);
app.use("/api/genres", genresRouter);
app.use("/api/books", booksRouter);
app.use("/api/authors", authorsRouter);
app.use("/api/login", loginRouter);

app.use(errorHandler);

export default app;

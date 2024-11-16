const jwt = require("jsonwebtoken");
const config = require("../utils/config");
import { NextFunction, Request, Response } from "express";

declare module "express-serve-static-core" {
  interface Request {
    token?: string;
  }
}

export const requestLogger = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);
  console.log("---");
  next();
};
export const errorHandler = (
  error: Error,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error")
  ) {
    const pattern = new RegExp(`${"index:"}\\s+(\\w+)`);
    const match = error.message.match(pattern);
    return response.status(400).json({ error: `expected name to be unique` });
  } else if (error.name === "JsonWebTokenError") {
    return response.status(401).json({ error: "token invalid" });
  } else if (error.name === "TokenExpiredError") {
    return response.status(401).json({
      error: "token expired",
    });
  }

  next(error);
};

export const tokenExtractor = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorization = req.get("authorization");
  if (authorization && authorization.startsWith("Bearer ")) {
    req.token = authorization.replace("Bearer ", "");
  } else {
    res.send({ error: "Bearer token not found" }).end();
  }
  next();
};

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.token;
  const tokenDecrypt = jwt.verify(token, config.SECRET);

  if (tokenDecrypt.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Only admin role can insert new data" });
  }
  next();
};

import { JwtPayload } from "jsonwebtoken";

export interface configType {
  PORT: string;
  MONGODB_URI: string;
  SALT_ROUNDS: number;
  SECRET: string;
}

export interface authorType {
  id?: string;
  name: string;
  age: number;
}

export interface genreType {
  id?: string;
  genre: string;
  popularity: number;
}

export interface bookType {
  id? = string;
  title: string;
  author: string;
  purchased?: number;
}

export interface BookGenreType {
  bookId: string;
  genreId: genreType[];
}

export interface UserType {
  id?: string;
  username: string;
  passwordHash: string;
  name: string;
  role: string;
}

interface JwtPayload {
  id: string;
  username: string;
  role: string;
}

declare module "express-serve-static-core" {
  interface Request {
    token?: string;
  }
}

import { Router, Request, Response, NextFunction } from "express";
import UserModel from "../models/user";
import jwt from "jsonwebtoken";
import { configType, UserType } from "../@types";
import bcrypt from "bcrypt";
const config: configType = require("../utils/config");

const loginRouter = Router();

loginRouter.post(
  "/",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, password } = req.body;
      const findUser: UserType | null = await UserModel.findOne({ username });
      if (!findUser) {
        res.send({ error: "User doesnt exist" });
        return;
      }
      const isPasswordVerified: Boolean = await bcrypt.compare(
        password,
        findUser!.passwordHash
      );
      if (!isPasswordVerified) {
        res.send({ error: "Username or password incorrect" });
        return;
      }
      const tokenUser = {
        id: findUser.id,
        username: findUser.username,
        role: findUser.role,
      };
      const token = jwt.sign(tokenUser, config.SECRET, { expiresIn: 60 * 60 });
      res
        .send({
          token,
          username: findUser.username,
          name: findUser.name,
          role: findUser.role,
        })
        .end();
    } catch (error) {
      next(error);
    }
  }
);

export default loginRouter;

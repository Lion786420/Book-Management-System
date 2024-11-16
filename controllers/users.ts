import { Router } from "express";
import UserModel from "../models/user";
import { UserType } from "../@types";
import { Request, Response } from "express";

const usersRouter = Router();

usersRouter.get("/", async (req: Request, res: Response): Promise<void> => {
  const users: UserType[] = await UserModel.find({});
  res.json(users);
});

usersRouter.post(
  "/",
  async (req: Request, res: Response, next): Promise<void> => {
    try {
      const { username, password, name, role } = req.body;
      const passwordHash: string = password;
      const newUser = new UserModel({
        username,
        passwordHash,
        name,
        role,
      });
      const savedUser: UserType = await newUser.save();
      res.json(savedUser);
    } catch (error) {
      next(error);
    }
  }
);

export default usersRouter;

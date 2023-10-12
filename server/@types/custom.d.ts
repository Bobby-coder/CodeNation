import { Request } from "express";
import { IUser } from "../model/User";

// Adding IUser interface to Request Interface
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

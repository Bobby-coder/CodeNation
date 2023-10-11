import { Request, Response, NextFunction } from "express";

export const catchAsyncError = function (asyncFunc: any) {
  return function (req: Request, res: Response, next: NextFunction) {
    return Promise.resolve(asyncFunc(req, res, next)).catch(next);
  };
};

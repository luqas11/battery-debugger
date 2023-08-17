import { RequestHandler } from "express";

/**
 * Logger used to print incoming request's method and path.
 */
export const logger: RequestHandler = (req, res, next) => {
  console.log(req.method + " " + req.path);
  next();
};

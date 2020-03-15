// Allow to use "Authorization" from request for auto-login (when provided by proxy)
import { NextFunction, Request, Response } from "express"
import { userSession } from "../user-session";

export function useRequestHeaderToken() {
  return (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.headers["authorization"] || req.headers["x-lens-kubectl-token"];
    const { authHeader, isUserLogin } = userSession.get(req);
    const userHasOwnToken = authHeader && isUserLogin;

    // don't overwrite user's login credentials
    if (authorization && !userHasOwnToken && authHeader !== authorization) {
      userSession.save(req, {
        authHeader: authorization.toString(),
      });
    }

    next();
  }
}

//-- User sessions helper

import { Request } from "express";
import CookieSessionObject = CookieSessionInterfaces.CookieSessionObject;

interface IUserSession extends CookieSessionObject {
  authHeader: string;
  username?: string;
  isUserLogin?: boolean; // authorization via user's manual login with credentials
}

export const userSession = {
  get(req: Request): Partial<IUserSession> {
    return req.session;
  },
  save(req: Request, data: Partial<IUserSession> = {}) {
    Object.assign(req.session, data);
  },
  getToken(req: Request): string {
    const { authHeader = "" } = this.get(req);
    const [type, token = ""] = authHeader.split(" ");
    return token;
  }
};

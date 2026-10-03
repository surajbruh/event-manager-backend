import type { JwtPayload } from "jsonwebtoken";

type UserRoleType = "user" | "organizer" | "admin";

interface AuthPayload {
  id: string;
  name: string;
  email: string;
  role: UserRoleType;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export { AuthPayload };

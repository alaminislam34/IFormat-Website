import { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: Role;
      tokenVersion?: number;
    }

    interface Request {
      id?: string;
      user?: User;
      rawBody?: Buffer;
    }
  }
}

export {};

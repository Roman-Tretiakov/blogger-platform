import "express-session";

declare module "express-session" {
  interface SessionData {
    userId: string;
    deviceId?: string;
    userAgent?: string;
    ip?: string;
    lastActive?: Date;
    isAuthenticated?: boolean;
  }
}

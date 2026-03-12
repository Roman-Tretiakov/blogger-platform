import { ObjectId } from "mongodb";

export interface AuthDevicesSessions {
  _id?: ObjectId;
  userId: string;
  refreshTokenVersion: string; // iat из JWT payload для ротации токенов
  deviceInfo: {
    deviceId: string;
    title: string;
    ip: string | null;
  };
  issuedAt: Date;
  expireAt: Date;
  lastActiveDate: Date;
}

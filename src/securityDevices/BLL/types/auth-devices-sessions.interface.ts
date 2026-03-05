import { ObjectId } from "mongodb";

export interface AuthDevicesSessions {
  _id?: ObjectId;
  userId: string;
  deviceInfo: {
    deviceId: string;
    title: string;
    ip: string;
  };
  issuedAt: Date;
  expireAt: Date;
  lastActiveDate: Date;
  isCurrentSession: boolean;
}

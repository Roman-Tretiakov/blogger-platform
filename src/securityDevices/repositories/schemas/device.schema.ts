import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAuthDeviceSession extends Document {
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

const DeviceSchema = new Schema<IAuthDeviceSession>({
  userId: { type: String, required: true },
  refreshTokenVersion: { type: String, required: true },
  deviceInfo: {
    ip: { type: String, default: null, required: false },
    title: { type: String, required: true },
    deviceId: { type: String, required: true },
  },
  issuedAt: { type: Date, required: true },
  expireAt: { type: Date, required: true },
  lastActiveDate: { type: Date, required: true },
});

DeviceSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export const AuthDeviceModel = mongoose.model<IAuthDeviceSession>(
  "AuthDevice",
  DeviceSchema,
);
export type LeanAuthDevice = IAuthDeviceSession & { _id: Types.ObjectId };

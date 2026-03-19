import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  login: string;
  email: string;
  password: string;
  createdAt: string;
  emailConfirmation: {
    confirmationCode: string | null;
    expirationDate: string | null;
    isConfirmed: boolean;
  };
  passwordRecovery: {
    recoveryCode: string | null;
    expirationDate: string | null;
  };
}

const UserSchema: Schema = new Schema<IUser>({
  login: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: String, required: true },
  emailConfirmation: {
    confirmationCode: { type: String, default: null, required: true },
    expirationDate: { type: String, default: null, required: true },
    isConfirmed: { type: Boolean, default: false, required: true },
  },
  passwordRecovery: {
    recoveryCode: { type: String, default: null, required: true },
    expirationDate: { type: String, default: null, required: true },
  },
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);
export type LeanUser = IUser & { _id: Types.ObjectId };

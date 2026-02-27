export type RefreshTokenViewModel = {
  id: string;
  token: string;
  userId: string | null;
  deviceId?: string | null | undefined;
  issuedAt?: Date;
  expiresAt: Date;
};

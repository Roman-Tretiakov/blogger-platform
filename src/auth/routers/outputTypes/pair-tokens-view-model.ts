export type pairTokensViewModel = {
  accessToken: string;
  refreshToken: {
    value: string;
    cookieOptions: {
      domain: string | undefined;
      path: string | undefined;
      httpOnly: boolean;
      secure: boolean;
      sameSite: boolean | "lax" | "strict" | "none" | undefined;
      maxAge: number;
    };
  };
};

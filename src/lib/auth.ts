export type SessionUser = {
  id: string;
  email: string;
  role: "ADMIN" | "USER";
};

export async function getSessionUser(): Promise<SessionUser | null> {
  return null;
}

export type AuthState = {
  error?: string;
};

export async function signupAction(): Promise<AuthState> {
  return { error: "Server actions are disabled in separated frontend deployment." };
}

export async function loginAction(): Promise<AuthState> {
  return { error: "Server actions are disabled in separated frontend deployment." };
}

export async function logoutAction() {
  return;
}

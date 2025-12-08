export interface AuthenticatedUser {
  userId: string;
  email: string;
  username: string;
}

export interface AuthenticatedRequest {
  user: AuthenticatedUser;
}

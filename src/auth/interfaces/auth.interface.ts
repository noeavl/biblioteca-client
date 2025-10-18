export interface User {
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

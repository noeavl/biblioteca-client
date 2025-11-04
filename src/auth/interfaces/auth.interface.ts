export interface User {
  _id: string;
  name: string;
  email: string;
  role: {
    _id: string;
    name: string;
  };
  status: boolean;
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
  updateUser: (user: User) => void;
}

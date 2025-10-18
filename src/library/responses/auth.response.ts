export interface AuthResponse {
    user: {
        name: string;
        email: string;
        role: string;
    };
    access_token: string;
}

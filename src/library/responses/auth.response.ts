export interface AuthResponse {
    user: {
        _id: string;
        name: string;
        email: string;
        role: {
            _id: string;
            name: string;
        };
        status: boolean;
    };
    access_token: string;
}

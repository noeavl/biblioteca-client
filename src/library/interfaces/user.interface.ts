export interface UserRole {
    _id: string;
    name: string;
    __v: number;
}

export interface User {
    _id: string;
    role: UserRole;
    name: string;
    email: string;
    status: boolean;
    __v: number;
}

import type { User } from './user.interface';

export interface Reader {
    _id: string;
    user: User;
    suscription: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

import type { Book } from './book.interface';

export interface AuthorPerson {
    _id: string;
    firstName: string;
    lastName: string;
    __v: number;
}

export interface Author {
    _id: string;
    person: AuthorPerson;
    books: Book[];
    __v: number;
    fileName?: string;
}

export interface AuthorCard {
    _id: string;
    firstName: string;
    lastName: string;
    img?: string;
    quantityBooks: number;
}

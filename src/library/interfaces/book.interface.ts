export interface BookPerson {
    _id: string;
    firstName: string;
    lastName: string;
    __v: number;
}

export interface BookAuthor {
    _id: string;
    person: BookPerson;
    __v: number;
    fileName?: string;
}

export interface BookCategory {
    _id: string;
    name: string;
    __v: number;
    books?: string[];
    featuredBookCover?: string | null;
    status: boolean;
}

export interface Book {
    _id: string;
    author: BookAuthor;
    title: string;
    synopsis: string;
    publicationYear: number;
    category: BookCategory;
    __v: number;
    coverImage?: string;
    status: boolean;
    fileName?: string;
}

export interface CreateBookDto {
    authorId: string;
    title: string;
    synopsis: string;
    publicationYear: number;
    categoryId: string;
    status?: boolean;
    coverImage?: File;
}

export interface UpdateBookDto {
    authorId?: string;
    title?: string;
    synopsis?: string;
    publicationYear?: number;
    categoryId?: string;
    status?: boolean;
}

import type { DashboardStats } from '@/panel/interfaces/stats.interface';

export const mockDashboardStats: DashboardStats = {
    users: {
        totalReaders: 248,
        totalLibrarians: 12,
    },
    books: {
        totalBooks: 1523,
    },
    categories: {
        totalCategories: 45,
    },
    authors: {
        totalAuthors: 387,
    },
    bookRankings: {
        mostRead: [
            {
                _id: '1',
                title: 'Cien años de soledad',
                author: 'Gabriel García Márquez',
                category: 'Realismo mágico',
                coverImage:
                    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
                count: 342,
            },
            {
                _id: '2',
                title: 'Don Quijote de la Mancha',
                author: 'Miguel de Cervantes',
                category: 'Clásicos',
                coverImage:
                    'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400',
                count: 298,
            },
            {
                _id: '3',
                title: '1984',
                author: 'George Orwell',
                category: 'Distopía',
                coverImage:
                    'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
                count: 276,
            },
            {
                _id: '4',
                title: 'El principito',
                author: 'Antoine de Saint-Exupéry',
                category: 'Infantil',
                coverImage:
                    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
                count: 254,
            },
            {
                _id: '5',
                title: 'Harry Potter y la piedra filosofal',
                author: 'J.K. Rowling',
                category: 'Fantasía',
                coverImage:
                    'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=400',
                count: 231,
            },
        ],
        mostFavorited: [
            {
                _id: '6',
                title: 'Orgullo y prejuicio',
                author: 'Jane Austen',
                category: 'Romance',
                coverImage:
                    'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
                count: 189,
            },
            {
                _id: '7',
                title: 'El señor de los anillos',
                author: 'J.R.R. Tolkien',
                category: 'Fantasía épica',
                coverImage:
                    'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400',
                count: 167,
            },
            {
                _id: '1',
                title: 'Cien años de soledad',
                author: 'Gabriel García Márquez',
                category: 'Realismo mágico',
                coverImage:
                    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
                count: 156,
            },
            {
                _id: '8',
                title: 'El código Da Vinci',
                author: 'Dan Brown',
                category: 'Thriller',
                coverImage:
                    'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=400',
                count: 143,
            },
            {
                _id: '9',
                title: 'La sombra del viento',
                author: 'Carlos Ruiz Zafón',
                category: 'Misterio',
                coverImage:
                    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
                count: 132,
            },
        ],
    },
    categoryRankings: {
        mostRead: [
            {
                _id: 'cat1',
                name: 'Ficción',
                totalBooks: 342,
                count: 1245,
            },
            {
                _id: 'cat2',
                name: 'Ciencia ficción',
                totalBooks: 189,
                count: 987,
            },
            {
                _id: 'cat3',
                name: 'Romance',
                totalBooks: 276,
                count: 856,
            },
            {
                _id: 'cat4',
                name: 'Thriller',
                totalBooks: 198,
                count: 743,
            },
            {
                _id: 'cat5',
                name: 'Fantasía',
                totalBooks: 167,
                count: 698,
            },
        ],
        mostFavorited: [
            {
                _id: 'cat6',
                name: 'Clásicos',
                totalBooks: 234,
                count: 567,
            },
            {
                _id: 'cat1',
                name: 'Ficción',
                totalBooks: 342,
                count: 534,
            },
            {
                _id: 'cat3',
                name: 'Romance',
                totalBooks: 276,
                count: 498,
            },
            {
                _id: 'cat7',
                name: 'Historia',
                totalBooks: 145,
                count: 412,
            },
            {
                _id: 'cat5',
                name: 'Fantasía',
                totalBooks: 167,
                count: 389,
            },
        ],
    },
    authorRankings: {
        mostRead: [
            {
                _id: 'auth1',
                firstName: 'Gabriel',
                lastName: 'García Márquez',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
                totalBooks: 18,
                count: 892,
            },
            {
                _id: 'auth2',
                firstName: 'Isabel',
                lastName: 'Allende',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
                totalBooks: 24,
                count: 764,
            },
            {
                _id: 'auth3',
                firstName: 'Jorge Luis',
                lastName: 'Borges',
                totalBooks: 32,
                count: 698,
            },
            {
                _id: 'auth4',
                firstName: 'Julio',
                lastName: 'Cortázar',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
                totalBooks: 15,
                count: 623,
            },
            {
                _id: 'auth5',
                firstName: 'Mario',
                lastName: 'Vargas Llosa',
                totalBooks: 21,
                count: 587,
            },
        ],
        mostFavorited: [
            {
                _id: 'auth6',
                firstName: 'Jane',
                lastName: 'Austen',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
                totalBooks: 8,
                count: 456,
            },
            {
                _id: 'auth1',
                firstName: 'Gabriel',
                lastName: 'García Márquez',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
                totalBooks: 18,
                count: 421,
            },
            {
                _id: 'auth7',
                firstName: 'Carlos',
                lastName: 'Ruiz Zafón',
                totalBooks: 12,
                count: 389,
            },
            {
                _id: 'auth2',
                firstName: 'Isabel',
                lastName: 'Allende',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
                totalBooks: 24,
                count: 367,
            },
            {
                _id: 'auth8',
                firstName: 'Paulo',
                lastName: 'Coelho',
                avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
                totalBooks: 16,
                count: 334,
            },
        ],
    },
};

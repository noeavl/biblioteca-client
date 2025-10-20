import type { AuthorCard } from '@/library/interfaces/author.interface';
import gabrielImg from '@/assets/images/gabriel.png';
import edgarImg from '@/assets/images/edgar.png';
import janeImg from '@/assets/images/jane.png';
import fyodorImg from '@/assets/images/fyoodor.png';
import agataImg from '@/assets/images/agata.png';
import oscarImg from '@/assets/images/oscar.png';

export const authors: AuthorCard[] = [
    {
        _id: '1',
        firstName: 'Gabriel',
        lastName: 'García Márquez',
        quantityBooks: 123,
        img: gabrielImg,
    },
    {
        _id: '2',
        firstName: 'Edgar',
        lastName: 'Allan Poe',
        quantityBooks: 23,
        img: edgarImg,
    },
    {
        _id: '3',
        firstName: 'Jane',
        lastName: 'Austen',
        quantityBooks: 43,
        img: janeImg,
    },
    {
        _id: '4',
        firstName: 'Fyodor',
        lastName: 'Dostoevsky',
        quantityBooks: 76,
        img: fyodorImg,
    },
    {
        _id: '5',
        firstName: 'Agatha',
        lastName: 'Christie',
        quantityBooks: 23,
        img: agataImg,
    },
    {
        _id: '6',
        firstName: 'Oscar',
        lastName: 'Wilde',
        quantityBooks: 12,
        img: oscarImg,
    },
    {
        _id: '7',
        firstName: 'J.K.',
        lastName: 'Rowling',
        quantityBooks: 34,
    },
    {
        _id: '8',
        firstName: 'Miguel',
        lastName: 'de Cervantes',
        quantityBooks: 45,
    },
    {
        _id: '9',
        firstName: 'Ernest',
        lastName: 'Hemingway',
        quantityBooks: 28,
    },
    {
        _id: '10',
        firstName: 'Virginia',
        lastName: 'Woolf',
        quantityBooks: 31,
    },
];

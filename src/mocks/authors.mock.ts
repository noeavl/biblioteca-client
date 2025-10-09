import oscar from '@/assets/oscar.png';
import edgar from '@/assets/edgar.png';
import jane from '@/assets/jane.png';
import gabriel from '@/assets/gabriel.png';
import agatha from '@/assets/agata.png';
import fyoodor from '@/assets/fyoodor.png';

export interface Author {
    img: string;
    firstName: string;
    lastName: string;
    quantityBooks: number;
}

export const authors: Author[] = [
    {
        img: gabriel,
        firstName: 'Gabriel',
        lastName: 'García Márquez',
        quantityBooks: 123,
    },
    {
        img: edgar,
        firstName: 'Edgar',
        lastName: 'Allan Poe',
        quantityBooks: 23,
    },
    {
        img: jane,
        firstName: 'Jane',
        lastName: 'Austen',
        quantityBooks: 43,
    },
    {
        img: fyoodor,
        firstName: 'Fyodor',
        lastName: 'Dostoevsky',
        quantityBooks: 76,
    },
    {
        img: agatha,
        firstName: 'Agatha',
        lastName: 'Christie',
        quantityBooks: 23,
    },
    {
        img: oscar,
        firstName: 'Oscar',
        lastName: 'Wilde',
        quantityBooks: 12,
    },
];

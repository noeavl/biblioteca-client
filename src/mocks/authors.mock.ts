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
}

export const authors: Author[] = [
    {
        img: gabriel,
        firstName: 'Gabriel',
        lastName: 'García Márquez',
    },
    {
        img: edgar,
        firstName: 'Edgar',
        lastName: 'Allan Poe',
    },
    {
        img: jane,
        firstName: 'Jane',
        lastName: 'Austen',
    },
    {
        img: fyoodor,
        firstName: 'Fyodor',
        lastName: 'Dostoevsky',
    },
    {
        img: agatha,
        firstName: 'Agatha',
        lastName: 'Christie',
    },
    {
        img: oscar,
        firstName: 'Oscar',
        lastName: 'Wilde',
    },
];

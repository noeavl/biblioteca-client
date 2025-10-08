import elPrincipito from '@/assets/elprincipito.png';
import elHobbit from '@/assets/elhobbit.png';
import frankenstein from '@/assets/frankenstein.png';
import elMonje from '@/assets/elmonje.png';
import mathilda from '@/assets/mathilda.png';
import dracula from '@/assets/dracula.png';

export interface Book {
    title: string;
    publicationYear: number;
    img: string;
    category: string;
    author: string;
}

export const books: Book[] = [
    {
        title: 'Frankenstein',
        publicationYear: 1818,
        category: 'Literatura Gótica',
        author: 'Mary Wollstonecraft Shelley',
        img: frankenstein,
    },
    {
        title: 'El Principito',
        publicationYear: 1943,
        category: 'Ficción',
        author: 'Antoine de Saint-Exupéry',
        img: elPrincipito,
    },
    {
        title: 'El Hobbit',
        publicationYear: 1937,
        category: 'Fantasía',
        author: 'J.R.R. Tolkien',
        img: elHobbit,
    },
    {
        title: 'El Monje que Vendió su Ferrari',
        publicationYear: 1997,
        category: 'Autoayuda',
        author: 'Robin Sharma',
        img: elMonje,
    },
    {
        title: 'Matilda',
        publicationYear: 1988,
        category: 'Infantil',
        author: 'Roald Dahl',
        img: mathilda,
    },
    {
        title: 'Drácula',
        publicationYear: 1897,
        category: 'Literatura Gótica',
        author: 'Bram Stoker',
        img: dracula,
    },
];

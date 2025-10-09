import misterio from '@/assets/misterio.png';
import cienciaFiccion from '@/assets/ciencia-ficcion.png';
import biografias from '@/assets/biografias.png';
import romance from '@/assets/romance.png';
import fantasia from '@/assets/fantasia.png';
import historia from '@/assets/historia.png';

export interface Category {
    name: string;
    img: string;
    quantityBooks: number;
}
export const categories: Category[] = [
    {
        name: 'Fantasía',
        img: fantasia,
        quantityBooks: 78,
    },
    {
        name: 'Ciencia Ficción',
        img: cienciaFiccion,
        quantityBooks: 120,
    },
    {
        name: 'Misterio',
        img: misterio,
        quantityBooks: 34,
    },
    {
        name: 'Romance',
        img: romance,
        quantityBooks: 22,
    },
    {
        name: 'Historia',
        img: historia,
        quantityBooks: 98,
    },
    {
        name: 'Biografías',
        img: biografias,
        quantityBooks: 67,
    },
];

import misterio from '@/assets/misterio.png';
import cienciaFiccion from '@/assets/ciencia-ficcion.png';
import biografias from '@/assets/biografias.png';
import romance from '@/assets/romance.png';
import fantasia from '@/assets/fantasia.png';
import historia from '@/assets/historia.png';

export interface Category {
    name: string;
    img: string;
}
export const categories: Category[] = [
    {
        name: 'Fantasía',
        img: fantasia,
    },
    {
        name: 'Ciencia Ficción',
        img: cienciaFiccion,
    },
    {
        name: 'Misterio',
        img: misterio,
    },
    {
        name: 'Romance',
        img: romance,
    },
    {
        name: 'Historia',
        img: historia,
    },
    {
        name: 'Biografías',
        img: biografias,
    },
];

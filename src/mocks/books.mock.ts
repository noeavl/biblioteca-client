import elPrincipito from '@/assets/images/elprincipito.png';
import elHobbit from '@/assets/images/elhobbit.png';
import frankenstein from '@/assets/images/frankenstein.png';
import elMonje from '@/assets/images/elmonje.png';
import mathilda from '@/assets/images/mathilda.png';
import dracula from '@/assets/images/dracula.png';

import frankensteinPDF from '@/assets/pdfs/Frankenstein-Mary_Shelley.pdf';
import elPrincipitoPDF from '@/assets/pdfs/El_principito-Antoine_de_Saint-Exupery.pdf';
import draculaPDF from '@/assets/pdfs/Dracula-Stoker_Bram.pdf';
import meditacionesPDF from '@/assets/pdfs/Las_meditaciones_de_Marco_Aurelio-Marco_Aurelio.pdf';
import mathildaPDF from '@/assets/pdfs/Mathilda-Mary_Shelley.pdf';
import elMonjePDF from '@/assets/pdfs/El_monje_y_la_hija_del_verdugo-Bierce_Ambrose.pdf';

export interface Book {
    id: string;
    title: string;
    publicationYear: number;
    img: string;
    pdf?: string;
    category: string;
    author: string;
    synopsis?: string;
    isFavorite?: boolean;
    isRead?: boolean;
}

export const books: Book[] = [
    {
        id: '507f1f77bcf86cd799439011',
        title: 'Frankenstein',
        publicationYear: 1818,
        category: 'Literatura Gótica',
        author: 'Mary Wollstonecraft Shelley',
        img: frankenstein,
        pdf: frankensteinPDF,
        synopsis:
            'La historia del joven científico Victor Frankenstein que crea una criatura en un experimento poco ortodoxo. Una reflexión profunda sobre la ambición científica, la responsabilidad y las consecuencias de jugar a ser Dios.',
    },
    {
        id: '507f1f77bcf86cd799439012',
        title: 'El Principito',
        publicationYear: 1943,
        category: 'Ficción',
        author: 'Antoine de Saint-Exupéry',
        img: elPrincipito,
        pdf: elPrincipitoPDF,
        synopsis:
            'Un pequeño príncipe viaja por diferentes planetas y conoce personajes peculiares, hasta llegar a la Tierra donde encuentra a un aviador en el desierto. Una hermosa fábula sobre la amistad, el amor y el sentido de la vida.',
    },
    {
        id: '507f1f77bcf86cd799439013',
        title: 'El Hobbit',
        publicationYear: 1937,
        category: 'Fantasía',
        author: 'J.R.R. Tolkien',
        img: elHobbit,
        pdf: meditacionesPDF,
        synopsis:
            'Bilbo Bolsón, un hobbit hogareño, se embarca en una aventura épica junto a un grupo de enanos para recuperar su tesoro custodiado por el dragón Smaug. Una historia de valor, amistad y descubrimiento personal.',
    },
    {
        id: '507f1f77bcf86cd799439014',
        title: 'El Monje que Vendió su Ferrari',
        publicationYear: 1997,
        category: 'Autoayuda',
        author: 'Robin Sharma',
        img: elMonje,
        pdf: elMonjePDF,
        synopsis:
            'Un exitoso abogado abandona su lujosa vida tras un colapso, viaja al Himalaya y descubre secretos ancestrales para vivir con felicidad, propósito y paz interior. Una fábula inspiradora sobre el desarrollo personal.',
    },
    {
        id: '507f1f77bcf86cd799439015',
        title: 'Matilda',
        publicationYear: 1988,
        category: 'Infantil',
        author: 'Roald Dahl',
        img: mathilda,
        pdf: mathildaPDF,
        synopsis:
            'Matilda es una niña extraordinariamente inteligente con poderes telequinéticos que enfrenta a su horrible familia y a la temible directora de su escuela. Una historia de valentía, justicia y el poder de la inteligencia.',
    },
    {
        id: '507f1f77bcf86cd799439016',
        title: 'Drácula',
        publicationYear: 1897,
        category: 'Literatura Gótica',
        author: 'Bram Stoker',
        img: dracula,
        pdf: draculaPDF,
        synopsis:
            'El conde Drácula viaja desde Transilvania a Inglaterra para propagar la maldición de los no-muertos. Un grupo de valientes debe enfrentarse al príncipe de las tinieblas en una batalla épica entre el bien y el mal.',
    },
];

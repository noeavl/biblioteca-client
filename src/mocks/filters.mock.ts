import type { MenuItem } from '@/library/components/SidebarGroupItems';

export const orderByItems = [
    {
        name: 'Popularidad',
    },
    {
        name: 'Recientes',
    },
    {
        name: 'Alfabético (A-Z)',
    },
    {
        name: 'Alfabético (Z-A)',
    },
];

export const menuItems: MenuItem[] = [
    {
        name: 'Favoritos',
        url: 'favoritos',
        icon: 'favorite',
    },
    {
        name: 'Leídos',
        url: 'leidos',
        icon: 'check',
    },
];

export const collectionsItems: MenuItem[] = [
    {
        name: 'Colecciones',
        url: 'colecciones',
        icon: 'stacks',
    },
];

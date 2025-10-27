import type { MenuItem } from '@/library/components/SidebarGroupItems';

export type SortType = 'recent' | 'alphabetical_asc' | 'alphabetical_desc';

export const orderByItems = [
    {
        name: 'Recientes',
        value: 'recent' as SortType,
    },
    {
        name: 'Alfabético (A-Z)',
        value: 'alphabetical_asc' as SortType,
    },
    {
        name: 'Alfabético (Z-A)',
        value: 'alphabetical_desc' as SortType,
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

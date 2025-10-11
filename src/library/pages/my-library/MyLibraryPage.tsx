import {
    FilterSideBar,
    type FilterConfig,
} from '@/library/components/FilterSidebar';
import { MyLibraryLayout } from '@/library/layouts/MyLibraryLayout';
import {
    collectionsItems,
    menuItems,
    orderByItems,
} from '@/mocks/filters.mock';
import { Outlet, useLocation } from 'react-router';

const categoriesFilters: FilterConfig[] = [
    { type: 'menu-item', label: 'Mi Biblioteca', items: menuItems },
    { type: 'menu-item', label: 'Colecciones', items: collectionsItems },
    { type: 'radio', label: 'Ordernar Por', items: orderByItems },
];

const getTitleByPath = (pathname: string): string => {
    if (pathname.includes('/favoritos')) return 'Favoritos';
    if (pathname.includes('/colecciones')) return 'Colecciones';
    if (pathname.includes('/leidos')) return 'Leídos';
    return 'Mi Biblioteca';
};

export const MyLibraryPage = () => {
    const location = useLocation();
    const title = getTitleByPath(location.pathname);

    return (
        <MyLibraryLayout
            title={title}
            sidebar={<FilterSideBar filters={categoriesFilters} />}
        >
            <Outlet />
        </MyLibraryLayout>
    );
};

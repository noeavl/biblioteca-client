import { CustomLogo } from '@/components/custom/CustomLogo';
import { Icon } from '@/components/custom/Icon';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link } from 'react-router';
import { useAuth } from '@/auth/hooks/useAuth';

// Menu items.
const items = [
    {
        title: 'Inicio',
        url: '/panel',
        icon: 'dashboard',
        allowedRoles: ['admin', 'librarian', 'executive'], // Todos los roles del panel pueden ver inicio
    },
    {
        title: 'Libros',
        url: '/panel/libros',
        icon: 'book_2',
        allowedRoles: ['admin', 'librarian'], // Solo admin y bibliotecarios
    },
    {
        title: 'Autores',
        url: '/panel/autores',
        icon: 'history_edu',
        allowedRoles: ['admin', 'librarian'], // Solo admin y bibliotecarios
    },
    {
        title: 'Categorías',
        url: '/panel/categorias',
        icon: 'category',
        allowedRoles: ['admin', 'librarian'], // Solo admin y bibliotecarios
    },
    {
        title: 'Usuarios',
        url: '/panel/usuarios',
        icon: 'person',
        allowedRoles: ['admin', 'librarian'], // Solo admin y bibliotecarios
    },
];

export const PanelSidebar = () => {
    const { user } = useAuth();
    const userRole = user?.role?.name;

    // Filtrar items según el rol del usuario
    const visibleItems = items.filter((item) =>
        item.allowedRoles.includes(userRole || '')
    );

    return (
        <Sidebar className="border-none p-6 shadow-lg">
            <SidebarHeader className="bg-background">
                <CustomLogo />
            </SidebarHeader>
            <SidebarContent className="bg-background">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {visibleItems.map((item) => (
                                <SidebarMenuItem key={item.url}>
                                    <SidebarMenuButton asChild>
                                        <Link to={item.url}>
                                            <Icon icon={item.icon} />
                                            {item.title}
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="bg-background"></SidebarFooter>
        </Sidebar>
    );
};

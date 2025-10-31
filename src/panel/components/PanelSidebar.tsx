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

// Menu items.
const items = [
    {
        title: 'Inicio',
        url: '/panel',
        icon: 'dashboard',
    },
    {
        title: 'Libros',
        url: '/panel/libros',
        icon: 'book_2',
    },
    {
        title: 'Autores',
        url: '/panel/autores',
        icon: 'history_edu',
    },
    {
        title: 'Categorías',
        url: '/panel/categorias',
        icon: 'category',
    },
    {
        title: 'Usuarios',
        url: '/panel/usuarios',
        icon: 'person',
    },
    {
        title: 'Lectores',
        url: '/panel/lectores',
        icon: 'groups',
    },
];

export const PanelSidebar = () => {
    return (
        <Sidebar className="border-none p-6 shadow-lg">
            <SidebarHeader className="bg-background">
                <CustomLogo />
            </SidebarHeader>
            <SidebarContent className="bg-background">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
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

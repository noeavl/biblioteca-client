import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Icon } from '../../components/custom/Icon';
import { Link, useLocation } from 'react-router';

export interface MenuItem {
    name: string;
    url?: string;
    icon?: string;
    id?: string;
}

interface SidebarItemProps {
    label: string;
    items: Array<MenuItem>;
}

export const SidebarGroupItems = ({ label, items }: SidebarItemProps) => {
    const location = useLocation();

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="text-2xl mb-6 font-bold">
                {label}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const isActive = location.pathname === item.url;

                    return (
                        <SidebarMenuItem key={item.id ?? item.name}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                className={isActive ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300' : ''}
                            >
                                <Link to={item.url ?? '/'}>
                                    <Icon icon={item.icon} />
                                    <span>{item.name}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
};

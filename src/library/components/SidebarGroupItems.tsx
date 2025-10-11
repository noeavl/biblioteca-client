import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Icon } from './Icon';
import { Link } from 'react-router';

export interface MenuItem {
    name: string;
    url?: string;
    icon?: string;
}

interface SidebarItemProps {
    label: string;
    items: Array<MenuItem>;
}

export const SidebarGroupItems = ({ label, items }: SidebarItemProps) => {
    return (
        <SidebarGroup>
            <SidebarGroupLabel className="text-2xl mb-6 text-black font-bold">
                {label}
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild>
                            <Link to={item.url ?? '/'}>
                                <Icon icon={item.icon} />
                                <span>{item.name}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
};

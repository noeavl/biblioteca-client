import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Outlet } from 'react-router';
import { PanelSidebar } from '../components/PanelSidebar';

export const PanelLayout = () => {
    return (
        <SidebarProvider>
            <PanelSidebar />
            <main className="p-8">
                <SidebarTrigger />
                <Outlet />
            </main>
        </SidebarProvider>
    );
};

import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Outlet } from 'react-router';
import { PanelSidebar } from '../components/PanelSidebar';
import { Toaster } from '@/components/ui/sonner';

export const PanelLayout = () => {
    return (
        <SidebarProvider>
            <PanelSidebar />
            <main className="p-8 w-full">
                <SidebarTrigger />
                <Outlet />
            </main>
            <Toaster />
        </SidebarProvider>
    );
};

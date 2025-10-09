import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import type React from 'react';
import { FilterSideBar } from '../components/FilterSidebar';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="p-4 sm:p-6 md:p-8">
            <SidebarProvider className="relative" defaultOpen={true}>
                <FilterSideBar />
                <main className="w-full md:w-auto md:ps-6 lg:ps-8">
                    <SidebarTrigger className="md:hidden mb-4" />
                    {children}
                </main>
            </SidebarProvider>
        </div>
    );
};

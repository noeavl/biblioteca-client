import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import type React from 'react';

export const MainLayout = ({
    title,
    children,
    sidebar,
}: {
    title: string;
    children: React.ReactNode;
    sidebar: React.ReactNode;
}) => {
    return (
        <div className="p-4 sm:p-6 md:p-8 bg-muted/40">
            <SidebarProvider className="relative" defaultOpen={true}>
                {sidebar}
                <main className="w-full md:ps-6 lg:ps-8">
                    <SidebarTrigger className="md:hidden mb-4" />
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                        {title}
                    </h2>
                    {children}
                </main>
            </SidebarProvider>
        </div>
    );
};

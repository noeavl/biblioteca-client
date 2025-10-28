import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarGroupFilterRadioGroup } from './SidebarGroupFilterRadioGroup';
import { SidebarGroupItems } from './SidebarGroupItems';
import { SidebarGroupFilterCheckbox } from './SidebarGroupFilterCheckbox';

type Type = 'radio' | 'checkbox' | 'menu-item' | 'group-items';

export interface FilterConfig {
    type: Type;
    label: string;
    items: Array<{
        name: string;
        id?: string;
        value?: string;
        quantityBooks?: number;
        url?: string;
        icon?: string;
    }>;
    onChange?: (value: string, checked?: boolean) => void;
}

interface FilterSideBarProps {
    filters: FilterConfig[];
    isLoading?: boolean;
}

const FilterSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-3 ml-2">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-40" />
                </div>
            ))}
        </div>
    </div>
);

export const FilterSideBar = ({ filters, isLoading = false }: FilterSideBarProps) => {
    return (
        <Sidebar className="absolute top-0 justify-center items-center border-none bg-none">
            <SidebarContent className="bg-white shadow-xl rounded-2xl p-6">
                {filters.map((filter, index) => {
                    let component;

                    switch (filter.type) {
                        case 'radio':
                            component = (
                                <SidebarGroupFilterRadioGroup
                                    label={filter.label}
                                    items={filter.items}
                                    onChange={(value) => filter.onChange?.(value)}
                                />
                            );
                            break;
                        case 'checkbox':
                            component = (
                                <SidebarGroupFilterCheckbox
                                    label={filter.label}
                                    items={filter.items}
                                    onChange={filter.onChange}
                                />
                            );
                            break;
                        case 'menu-item':
                            component = (
                                <SidebarGroupItems
                                    label={filter.label}
                                    items={filter.items}
                                />
                            );
                            break;
                        default:
                            component = null;
                    }

                    return (
                        <div key={filter.label}>
                            {component}
                            {index < filters.length - 1 && (
                                <Separator className="my-6" />
                            )}
                        </div>
                    );
                })}

                {/* Mostrar skeletons mientras cargan los filtros */}
                {isLoading && (
                    <>
                        <Separator className="my-6" />
                        <FilterSkeleton />
                        <Separator className="my-6" />
                        <FilterSkeleton />
                    </>
                )}
            </SidebarContent>
        </Sidebar>
    );
};

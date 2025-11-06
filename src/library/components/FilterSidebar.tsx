import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { SidebarGroupFilterRadioGroup } from './SidebarGroupFilterRadioGroup';
import { SidebarGroupItems } from './SidebarGroupItems';
import { SidebarGroupFilterCheckbox } from './SidebarGroupFilterCheckbox';
import { NewCollection } from './NewCollection';

type Type = 'radio' | 'checkbox' | 'menu-item' | 'group-items' | 'new-collection' | 'collection-list' | 'empty-collections';

export interface FilterConfig {
    type: Type;
    label: string;
    items?: Array<{
        name: string;
        id?: string;
        value?: string;
        quantityBooks?: number;
        url?: string;
        icon?: string;
    }>;
    onChange?: (value: string, checked?: boolean) => void;
    onAddCollection?: (name: string) => Promise<void>;
    onDeleteCollection?: (collectionId: string) => Promise<void>;
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

export const FilterSideBar = ({
    filters,
    isLoading = false,
}: FilterSideBarProps) => {
    return (
        <Sidebar className="absolute top-0 justify-center items-center border-none bg-none">
            <SidebarContent className="bg-background shadow-xl rounded-2xl p-6">
                {filters.map((filter, index) => {
                    let component;

                    switch (filter.type) {
                        case 'radio':
                            component = (
                                <SidebarGroupFilterRadioGroup
                                    label={filter.label}
                                    items={filter.items!}
                                    onChange={(value) =>
                                        filter.onChange?.(value)
                                    }
                                />
                            );
                            break;
                        case 'checkbox':
                            component = (
                                <SidebarGroupFilterCheckbox
                                    label={filter.label}
                                    items={filter.items!}
                                    onChange={filter.onChange}
                                />
                            );
                            break;
                        case 'menu-item':
                            component = (
                                <SidebarGroupItems
                                    label={filter.label}
                                    items={filter.items!}
                                />
                            );
                            break;
                        case 'collection-list':
                            component = (
                                <div className="max-h-60 overflow-y-auto">
                                    <SidebarGroupItems
                                        label={filter.label}
                                        items={filter.items!}
                                        onDeleteCollection={filter.onDeleteCollection}
                                    />
                                </div>
                            );
                            break;
                        case 'new-collection':
                            component = (
                                <NewCollection
                                    onAddCollection={filter.onAddCollection!}
                                />
                            );
                            break;
                        case 'empty-collections':
                            component = (
                                <div className="py-4 text-center">
                                    <span className="material-symbols-outlined text-muted-foreground mb-2" style={{ fontSize: '2rem' }}>
                                        collections_bookmark
                                    </span>
                                    <p className="text-sm text-muted-foreground">
                                        {filter.label}
                                    </p>
                                </div>
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

import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { SidebarGroupFilterCheckbox } from './SidebarGroupFilterCheckbox.tsx';
import { Separator } from '@/components/ui/separator';
import { SidebarGroupFilterRadioGroup } from './SidebarGroupFilterRadioGroup.tsx';
import { SidebarGroupItems } from './SidebarGroupItems.tsx';

type Type = 'radio' | 'checkbox' | 'menu-item' | 'group-items';

export interface FilterConfig {
    type: Type;
    label: string;
    items: Array<{
        name: string;
        quantityBooks?: number;
        url?: string;
        icon?: string;
    }>;
}

export const FilterSideBar = ({ filters }: { filters: FilterConfig[] }) => {
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
                                />
                            );
                            break;
                        case 'checkbox':
                            component = (
                                <SidebarGroupFilterCheckbox
                                    label={filter.label}
                                    items={filter.items}
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
            </SidebarContent>
        </Sidebar>
    );
};

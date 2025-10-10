import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { SidebarGroupFilterCheckbox } from './SidebarGroupFilterCheckbox';
import { Separator } from '@/components/ui/separator';
import { SideBarGroupFilterRadioGroup } from './SideBarGroupFilterRadioGroup';

type Type = 'radio' | 'checkbox';

export interface FilterConfig {
    type: Type;
    label: string;
    items: Array<{ name: string; quantityBooks?: number }>;
}

export const FilterSideBar = ({ filters }: { filters: FilterConfig[] }) => {
    return (
        <Sidebar className="absolute top-0 justify-center items-center border-none bg-none">
            <SidebarContent className="bg-white shadow-xl rounded-2xl p-6">
                {filters.map((filter, index) => (
                    <div key={filter.label}>
                        {filter.type === 'radio' ? (
                            <SideBarGroupFilterRadioGroup
                                key={filter.label}
                                label={filter.label}
                                items={filter.items}
                            />
                        ) : (
                            <SidebarGroupFilterCheckbox
                                key={filter.label}
                                label={filter.label}
                                items={filter.items}
                            />
                        )}
                        {index < filters.length - 1 && (
                            <Separator className="my-6" />
                        )}
                    </div>
                ))}
            </SidebarContent>
        </Sidebar>
    );
};

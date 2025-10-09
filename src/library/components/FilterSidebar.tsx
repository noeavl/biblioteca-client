import { Sidebar, SidebarContent } from '@/components/ui/sidebar';
import { SidebarGroupFilterCheckbox } from './SidebarGroupFilterCheckbox';
import { categories } from '@/mocks/categories.mock';
import { authors } from '@/mocks/authors.mock';
import { Separator } from '@/components/ui/separator';
import { SideBarGroupFilterRadioGroup } from './SideBarGroupFilterRadioGroup';

const OrderByItems = [
    {
        name: 'Popularidad',
    },
    {
        name: 'Recientes',
    },
    {
        name: 'Alfabético (A-Z)',
    },
    {
        name: 'Alfabético (Z-A)',
    },
];

export const FilterSideBar = () => {
    return (
        <Sidebar className="absolute top-0 justify-center items-center border-none bg-none">
            <SidebarContent className="bg-white shadow-xl rounded-2xl p-6">
                <div>
                    <SideBarGroupFilterRadioGroup
                        label="Ordenar Por"
                        items={OrderByItems}
                    />
                    <Separator className="my-6" />
                    <SidebarGroupFilterCheckbox
                        label="Categorías"
                        items={categories}
                    />
                    <Separator className="my-6" />
                    <SidebarGroupFilterCheckbox
                        label="Autores"
                        items={authors.map((author) => ({
                            name: `${author.firstName} ${author.lastName}`,
                            quantityBooks: author.quantityBooks,
                        }))}
                    />
                </div>
            </SidebarContent>
        </Sidebar>
    );
};

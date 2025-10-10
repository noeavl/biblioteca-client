import type { Category } from '@/mocks/categories.mock';
import { CategoryCard } from './CategoryCard';

interface CategoriesGridProps {
    categories: Category[];
    showQuantityBooks?: boolean;
}
export const CategoriesGrid = ({
    categories,
    showQuantityBooks,
}: CategoriesGridProps) => {
    return (
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
                <CategoryCard
                    key={category.name}
                    name={category.name}
                    img={category.img}
                    quantityBooks={category.quantityBooks}
                    showQuantityBooks={showQuantityBooks}
                ></CategoryCard>
            ))}
        </div>
    );
};

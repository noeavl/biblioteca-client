import type { Category } from '@/mocks/categories.mock';
import { CategoryCard } from './CategoryCard';

interface CategoriesGridProps {
    categories: Category[];
}
export const CategoriesGrid = ({ categories }: CategoriesGridProps) => {
    return (
        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
                <CategoryCard
                    key={category.name}
                    name={category.name}
                    img={category.img}
                ></CategoryCard>
            ))}
        </div>
    );
};

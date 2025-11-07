import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CategoryRankingItem } from '@/panel/interfaces/stats.interface';
import { Eye, Heart, BookOpen, ArrowRight, Library } from 'lucide-react';
import { Link } from 'react-router';
import { useAuth } from '@/auth/hooks/useAuth';

interface CategoryRankingCardProps {
    category: CategoryRankingItem;
    type: 'read' | 'favorite';
    rank: number;
}

export function CategoryRankingCard({
    category,
    type,
    rank,
}: CategoryRankingCardProps) {
    const { user } = useAuth();
    const isExecutive = user?.role?.name === 'executive';
    const icon = type === 'read' ? Eye : Heart;
    const IconComponent = icon;

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex gap-4">
                    {/* Icono de categoría */}
                    <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                            <Library className="text-blue-500 size-8" />
                        </div>
                        {/* Badge de ranking */}
                        <Badge
                            variant="secondary"
                            className="absolute -top-2 -left-2 h-6 w-6 rounded-full flex items-center justify-center p-0"
                        >
                            {rank}
                        </Badge>
                    </div>

                    {/* Información de la categoría */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate mb-2">
                            {category.name}
                        </h4>

                        {/* Cantidad de libros */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <BookOpen className="h-3 w-3" />
                            <span>{category.totalBooks} libros</span>
                        </div>

                        {/* Contador */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                            <IconComponent className="h-3 w-3" />
                            <span>
                                {category.count}{' '}
                                {type === 'read' ? 'lecturas' : 'favoritos'}
                            </span>
                        </div>

                        {/* Botón Ver Detalle */}
                        {!isExecutive && (
                            <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="w-full h-7 text-xs"
                            >
                                <Link
                                    to={`/panel/categorias/editar/${category._id}`}
                                >
                                    Ver detalle
                                    <ArrowRight className="ml-1 h-3 w-3" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

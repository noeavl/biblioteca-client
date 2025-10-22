import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BookRankingItem } from '@/panel/interfaces/stats.interface';
import { Eye, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

interface BookRankingCardProps {
    book: BookRankingItem;
    type: 'read' | 'favorite';
    rank: number;
}

export function BookRankingCard({ book, type, rank }: BookRankingCardProps) {
    const icon = type === 'read' ? Eye : Heart;
    const IconComponent = icon;

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex gap-4">
                    {/* Portada */}
                    <div className="relative flex-shrink-0">
                        <div className="w-16 h-24 rounded-md overflow-hidden bg-muted">
                            {book.coverImage ? (
                                <img
                                    src={book.coverImage}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <span className="text-xs">Sin portada</span>
                                </div>
                            )}
                        </div>
                        {/* Badge de ranking */}
                        <Badge
                            variant="secondary"
                            className="absolute -top-2 -left-2 h-6 w-6 rounded-full flex items-center justify-center p-0"
                        >
                            {rank}
                        </Badge>
                    </div>

                    {/* Información del libro */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate mb-1">
                            {book.title}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate mb-1">
                            {book.author}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mb-2">
                            {book.category}
                        </p>

                        {/* Contador */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                            <IconComponent className="h-3 w-3" />
                            <span>
                                {book.count}{' '}
                                {type === 'read' ? 'lecturas' : 'favoritos'}
                            </span>
                        </div>

                        {/* Botón Ver Detalle */}
                        <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="w-full h-7 text-xs"
                        >
                            <Link to={`/panel/libros/editar/${book._id}`}>
                                Ver detalle
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

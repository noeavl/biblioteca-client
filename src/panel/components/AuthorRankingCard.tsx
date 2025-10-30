import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { AuthorRankingItem } from '@/panel/interfaces/stats.interface';
import { Eye, Heart, BookOpen, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

interface AuthorRankingCardProps {
    author: AuthorRankingItem;
    type: 'read' | 'favorite';
    rank: number;
}

function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function AuthorRankingCard({
    author,
    type,
    rank,
}: AuthorRankingCardProps) {
    const icon = type === 'read' ? Eye : Heart;
    const IconComponent = icon;

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="flex gap-4">
                    {/* Avatar con badge de ranking */}
                    <div className="relative flex-shrink-0">
                        <Avatar className="h-16 w-16">
                            {author.avatar && (
                                <AvatarImage
                                    src={author.avatar}
                                    alt={`${author.firstName} ${author.lastName}`}
                                />
                            )}
                            <AvatarFallback className="bg-blue-500 text-white text-lg">
                                {getInitials(author.firstName, author.lastName)}
                            </AvatarFallback>
                        </Avatar>
                        {/* Badge de ranking */}
                        <Badge
                            variant="secondary"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center p-0"
                        >
                            {rank}
                        </Badge>
                    </div>

                    {/* Información del autor */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate mb-1">
                            {author.firstName} {author.lastName}
                        </h4>

                        {/* Cantidad de libros */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <BookOpen className="h-3 w-3" />
                            <span>
                                {author.totalBooks}{' '}
                                {author.totalBooks === 1 ? 'libro' : 'libros'}
                            </span>
                        </div>

                        {/* Contador */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                            <IconComponent className="h-3 w-3" />
                            <span>
                                {author.count}{' '}
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
                            <Link to={`/panel/autores/editar/${author._id}`}>
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

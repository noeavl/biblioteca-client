import { Card } from '@/components/ui/card';
import { getAuthorById } from '@/library/api/authors.api';
import type { Author } from '@/library/interfaces/author.interface';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';

export const AuthorsBooksPage = () => {
    const { authorId } = useParams<{ authorId: string }>();
    const [author, setAuthor] = useState<Author | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getBook = async () => {
            if (!authorId) {
                setError('ID del author no valido');
                setLoading(false);
                return;
            }

            try {
                const authorData = await getAuthorById(authorId);
                setAuthor(authorData);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch (error) {
                setError('Error al cargar el libro');
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        getBook();
    }, [authorId]);

    if (loading) {
        <div>Cargando el author...</div>;
    }

    if (error || !author) {
        <div>Author no encontrado</div>;
    }

    const authorImageUrl = `${import.meta.env.VITE_API_URL}/files/author/${
        author?.fileName
    }`;
    const authorName = `${author?.person.firstName} ${author?.person.lastName}`;

    return (
        <div className="p-8">
            <Card className="bg-card-light dark:bg-card-dark p-6 sm:p-8 rounded-xl shadow-sm mb-8">
                <div className="flex flex-col sm:flex-row w-full gap-6">
                    <div className="w-48 h-48">
                        <img
                            className="w-full h-full object-cover rounded-full"
                            src={authorImageUrl}
                            alt={authorName}
                        />
                    </div>
                    <div className="flex flex-col justify-center text-center sm:text-left">
                        <h3 className="text-3xl sm:text-4xl font-bold leading-tight tracking-[-0.015em] text-text-light dark:text-text-dark">
                            {authorName}
                        </h3>
                    </div>
                </div>
            </Card>
            <div className="mb-6">
                <h3 className="text-2xl font-bold leading-tight tracking-[-0.015em] text-text-light dark:text-text-dark">
                    Books by {authorName}
                </h3>
            </div>
        </div>
    );
};

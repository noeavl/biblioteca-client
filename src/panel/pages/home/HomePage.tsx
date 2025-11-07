import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/panel/components/StatsCard';
import { BookRankingCard } from '@/panel/components/BookRankingCard';
import { CategoryRankingCard } from '@/panel/components/CategoryRankingCard';
import { AuthorRankingCard } from '@/panel/components/AuthorRankingCard';
import type { DashboardStats, BookRankingItem, CategoryRankingItem, AuthorRankingItem } from '@/panel/interfaces/stats.interface';
import type { DashboardAnalytics, TopFavoriteBook, TopReadBook, TopFavoriteAuthor, TopReadAuthor, TopFavoriteCategory, TopReadCategory } from '@/panel/interfaces/analytics.interface';
import { getDashboardAnalytics } from '@/panel/api/analytics.api';
import { BookOpen, FolderOpen, UserRound, Heart, BookMarked } from 'lucide-react';
import { toast } from 'sonner';

// Función auxiliar para transformar los datos de la API al formato esperado por los componentes
const transformAnalyticsToStats = (analytics: DashboardAnalytics): DashboardStats => {
  // Transformar libros más leídos
  const mostReadBooks: BookRankingItem[] = analytics.books.topReadBooks.map((book: TopReadBook) => ({
    _id: book._id,
    title: book.title,
    author: book.author.person.lastName,
    category: book.category.name,
    coverImage: book.coverImage
      ? `${import.meta.env.VITE_API_URL}/uploads/books/${book.coverImage}`
      : undefined,
    count: book.readCount,
  }));

  // Transformar libros más favoritos
  const mostFavoritedBooks: BookRankingItem[] = analytics.books.topFavoriteBooks.map((book: TopFavoriteBook) => ({
    _id: book._id,
    title: book.title,
    author: book.author.person.lastName,
    category: book.category.name,
    coverImage: book.coverImage
      ? `${import.meta.env.VITE_API_URL}/uploads/books/${book.coverImage}`
      : undefined,
    count: book.favoriteCount,
  }));

  // Transformar categorías más leídas
  const mostReadCategories: CategoryRankingItem[] = analytics.categories.topReadCategories.map((category: TopReadCategory) => ({
    _id: category._id,
    name: category.name,
    totalBooks: 0, // La API no devuelve este dato en el ranking
    count: category.readCount,
  }));

  // Transformar categorías más favoritas
  const mostFavoritedCategories: CategoryRankingItem[] = analytics.categories.topFavoriteCategories.map((category: TopFavoriteCategory) => ({
    _id: category._id,
    name: category.name,
    totalBooks: 0, // La API no devuelve este dato en el ranking
    count: category.favoriteCount,
  }));

  // Transformar autores más leídos
  const mostReadAuthors: AuthorRankingItem[] = analytics.authors.topReadAuthors.map((author: TopReadAuthor) => ({
    _id: author._id,
    firstName: author.person.firstName,
    lastName: author.person.lastName,
    avatar: undefined, // La API no devuelve avatar
    totalBooks: 0, // La API no devuelve este dato en el ranking
    count: author.readCount,
  }));

  // Transformar autores más favoritos
  const mostFavoritedAuthors: AuthorRankingItem[] = analytics.authors.topFavoriteAuthors.map((author: TopFavoriteAuthor) => ({
    _id: author._id,
    firstName: author.person.firstName,
    lastName: author.person.lastName,
    avatar: undefined, // La API no devuelve avatar
    totalBooks: 0, // La API no devuelve este dato en el ranking
    count: author.favoriteCount,
  }));

  return {
    users: {
      totalReaders: 0, // La API actual no proporciona estos datos
      totalLibrarians: 0,
    },
    books: {
      totalBooks: analytics.books.total,
    },
    categories: {
      totalCategories: analytics.categories.total,
    },
    authors: {
      totalAuthors: analytics.authors.total,
    },
    bookRankings: {
      mostRead: mostReadBooks,
      mostFavorited: mostFavoritedBooks,
    },
    categoryRankings: {
      mostRead: mostReadCategories,
      mostFavorited: mostFavoritedCategories,
    },
    authorRankings: {
      mostRead: mostReadAuthors,
      mostFavorited: mostFavoritedAuthors,
    },
    favorites: {
      total: analytics.favorites.total,
    },
    readingHistory: {
      total: analytics.readingHistory.total,
    },
  };
};

export const HomePage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const analytics = await getDashboardAnalytics();
        const transformedStats = transformAnalyticsToStats(analytics);
        setStats(transformedStats);
      } catch (error) {
        console.error('Error al cargar las estadísticas:', error);
        toast.error('Error al cargar las estadísticas del dashboard');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold">Panel de Inicio</h1>
        <div className="text-muted-foreground">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Panel de Inicio</h1>
        <p className="text-muted-foreground">
          Estadísticas y rankings de la biblioteca
        </p>
      </div>

      {/* Estadísticas Generales */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Estadísticas de la Biblioteca</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatsCard
            title="Total de Libros"
            value={stats.books.totalBooks}
            icon={BookOpen}
            iconColor="text-green-600"
            description="Libros en la colección"
          />
          <StatsCard
            title="Total de Categorías"
            value={stats.categories.totalCategories}
            icon={FolderOpen}
            iconColor="text-orange-600"
            description="Categorías disponibles"
          />
          <StatsCard
            title="Total de Autores"
            value={stats.authors.totalAuthors}
            icon={UserRound}
            iconColor="text-pink-600"
            description="Autores en catálogo"
          />
          <StatsCard
            title="Total de Favoritos"
            value={stats.favorites?.total || 0}
            icon={Heart}
            iconColor="text-red-600"
            description="Libros marcados como favoritos"
          />
          <StatsCard
            title="Total de Lecturas"
            value={stats.readingHistory?.total || 0}
            icon={BookMarked}
            iconColor="text-blue-600"
            description="Historial de lecturas"
          />
        </div>
      </section>

      {/* Rankings de Libros */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Ranking de Libros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="read" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="read">Más Leídos</TabsTrigger>
                <TabsTrigger value="favorite">Más Favoritos</TabsTrigger>
              </TabsList>
              <TabsContent value="read" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stats.bookRankings.mostRead.map((book, index) => (
                    <BookRankingCard
                      key={book._id}
                      book={book}
                      type="read"
                      rank={index + 1}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="favorite" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stats.bookRankings.mostFavorited.map((book, index) => (
                    <BookRankingCard
                      key={book._id}
                      book={book}
                      type="favorite"
                      rank={index + 1}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      {/* Rankings de Categorías */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Ranking de Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="read" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="read">Más Leídas</TabsTrigger>
                <TabsTrigger value="favorite">Más Favoritas</TabsTrigger>
              </TabsList>
              <TabsContent value="read" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stats.categoryRankings.mostRead.map((category, index) => (
                    <CategoryRankingCard
                      key={category._id}
                      category={category}
                      type="read"
                      rank={index + 1}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="favorite" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stats.categoryRankings.mostFavorited.map(
                    (category, index) => (
                      <CategoryRankingCard
                        key={category._id}
                        category={category}
                        type="favorite"
                        rank={index + 1}
                      />
                    )
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>

      {/* Rankings de Autores */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Ranking de Autores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="read" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="read">Más Leídos</TabsTrigger>
                <TabsTrigger value="favorite">Más Favoritos</TabsTrigger>
              </TabsList>
              <TabsContent value="read" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stats.authorRankings.mostRead.map((author, index) => (
                    <AuthorRankingCard
                      key={author._id}
                      author={author}
                      type="read"
                      rank={index + 1}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="favorite" className="mt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {stats.authorRankings.mostFavorited.map((author, index) => (
                    <AuthorRankingCard
                      key={author._id}
                      author={author}
                      type="favorite"
                      rank={index + 1}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

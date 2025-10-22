import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/panel/components/StatsCard';
import { BookRankingCard } from '@/panel/components/BookRankingCard';
import { CategoryRankingCard } from '@/panel/components/CategoryRankingCard';
import { AuthorRankingCard } from '@/panel/components/AuthorRankingCard';
import type { DashboardStats } from '@/panel/interfaces/stats.interface';
import { mockDashboardStats } from '@/mocks/dashboard-stats';
import { Users, UserCog, BookOpen, FolderOpen, UserRound } from 'lucide-react';

export const HomePage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carga de datos
    const loadStats = async () => {
      setLoading(true);
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setStats(mockDashboardStats);
      setLoading(false);
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

      {/* Estadísticas de Usuarios */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Usuarios</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          <StatsCard
            title="Total de Lectores"
            value={stats.users.totalReaders}
            icon={Users}
            iconColor="text-blue-600"
            description="Usuarios con rol de lector"
          />
          <StatsCard
            title="Total de Bibliotecarios"
            value={stats.users.totalLibrarians}
            icon={UserCog}
            iconColor="text-purple-600"
            description="Personal de la biblioteca"
          />
        </div>
      </section>

      {/* Estadísticas Generales */}
      <section>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
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

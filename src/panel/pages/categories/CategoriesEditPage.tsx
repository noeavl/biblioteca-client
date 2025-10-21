import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { getCategoryById, updateCategory } from '@/panel/api/categories.api';
import { toast } from 'sonner';

export const CategoriesEditPage = () => {
    const navigate = useNavigate();
    const { categoryId } = useParams<{ categoryId: string }>();
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [name, setName] = useState('');

    // Cargar datos de la categoría
    useEffect(() => {
        const fetchCategory = async () => {
            if (!categoryId) {
                toast.error('ID de categoría no válido');
                navigate('/panel/categorias');
                return;
            }

            try {
                setLoadingData(true);
                const category = await getCategoryById(categoryId);
                setName(category.name);
            } catch (error) {
                toast.error('Error al cargar los datos de la categoría');
                console.error(error);
                navigate('/panel/categorias');
            } finally {
                setLoadingData(false);
            }
        };

        fetchCategory();
    }, [categoryId, navigate]);

    // Manejar submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!categoryId) {
            toast.error('ID de categoría no válido');
            return;
        }

        // Validaciones del frontend (opcionales)
        if (name.trim() && name.trim().length > 100) {
            toast.error('El nombre no debe superar los 100 caracteres');
            return;
        }

        try {
            setLoading(true);

            // Preparar datos de actualización
            const updateData: { name?: string } = {};

            if (name.trim()) {
                updateData.name = name.trim();
            }

            // Actualizar categoría
            await updateCategory(categoryId, updateData);

            toast.success('Categoría actualizada exitosamente');
            navigate('/panel/categorias');
        } catch (error: any) {
            // Manejar errores de validación del backend
            if (error?.response?.data?.message) {
                const messages = error.response.data.message;
                if (Array.isArray(messages)) {
                    messages.forEach((msg: string) => toast.error(msg));
                } else {
                    toast.error(messages);
                }
            } else {
                toast.error('Error al actualizar la categoría');
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-6 w-full max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/panel/categorias')}
                >
                    <ArrowLeft />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Editar Categoría
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Modifica la información de la categoría
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Información de la Categoría</CardTitle>
                        <CardDescription>
                            Todos los campos son opcionales
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Nombre */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                placeholder="Ej: Terror, Fantasía, Ciencia Ficción"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                maxLength={100}
                            />
                            <p className="text-xs text-muted-foreground">
                                {name.length}/100 caracteres
                            </p>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/panel/categorias')}
                                disabled={loading}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? 'Guardando...' : 'Guardar Cambios'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

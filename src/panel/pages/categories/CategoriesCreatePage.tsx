import { useState } from 'react';
import { useNavigate } from 'react-router';
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
import { createCategory } from '@/panel/api/categories.api';
import { toast } from 'sonner';

export const CategoriesCreatePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');

    // Manejar submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones del frontend
        if (!name.trim()) {
            toast.error('El nombre es requerido');
            return;
        }

        if (name.trim().length < 1) {
            toast.error('El nombre debe tener al menos 1 carácter');
            return;
        }

        if (name.trim().length > 100) {
            toast.error('El nombre no debe superar los 100 caracteres');
            return;
        }

        try {
            setLoading(true);

            // Crear la categoría
            await createCategory({ name: name.trim() });

            toast.success('Categoría creada exitosamente');
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
                toast.error('Error al crear la categoría');
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

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
                        Crear Nueva Categoría
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Completa la información de la categoría
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Información de la Categoría</CardTitle>
                        <CardDescription>
                            Los campos marcados con * son obligatorios
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Nombre */}
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                Nombre <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="Ej: Terror, Fantasía, Ciencia Ficción"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
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
                                {loading ? 'Creando...' : 'Crear Categoría'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

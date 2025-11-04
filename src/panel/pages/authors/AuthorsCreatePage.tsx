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
import { ArrowLeft, X } from 'lucide-react';
import { createAuthor, uploadAuthorImage } from '@/panel/api/authors.api';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const AuthorsCreatePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        status: true,
    });

    const [authorImage, setAuthorImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Manejar cambio de imagen
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                toast.error('Por favor selecciona una imagen válida');
                return;
            }

            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('La imagen no debe superar los 5MB');
                return;
            }

            setAuthorImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remover imagen
    const handleRemoveImage = () => {
        setAuthorImage(null);
        setPreviewUrl(null);
    };

    // Manejar submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validaciones
        if (!formData.firstName.trim()) {
            toast.error('El nombre es requerido');
            return;
        }

        if (!formData.lastName.trim()) {
            toast.error('El apellido es requerido');
            return;
        }

        try {
            setLoading(true);

            // Crear el autor primero
            const response = await createAuthor(formData);
            const newAuthor = response.author;

            // Subir imagen si existe
            if (authorImage && newAuthor._id) {
                try {
                    await uploadAuthorImage(newAuthor._id, authorImage);
                    toast.success('Autor e imagen creados exitosamente');
                } catch (uploadError) {
                    console.error('Error al subir imagen:', uploadError);
                    toast.warning(
                        'Autor creado, pero hubo un error al subir la imagen'
                    );
                }
            } else {
                toast.success('Autor creado exitosamente');
            }

            navigate('/panel/autores');
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
                toast.error('Error al crear el autor');
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Generar iniciales para el avatar
    const getInitials = () => {
        const first = formData.firstName.trim()[0] || '';
        const last = formData.lastName.trim()[0] || '';
        return (first + last).toUpperCase();
    };

    return (
        <div className="flex flex-col gap-6 p-6 w-full max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/panel/autores')}
                >
                    <ArrowLeft />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Crear Nuevo Autor
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Completa la información del autor
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Información del Autor</CardTitle>
                        <CardDescription>
                            Los campos marcados con * son obligatorios
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Nombre */}
                        <div className="space-y-2">
                            <Label htmlFor="firstName">
                                Nombre <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="firstName"
                                placeholder="Ej: Gabriel"
                                value={formData.firstName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        firstName: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        {/* Apellido */}
                        <div className="space-y-2">
                            <Label htmlFor="lastName">
                                Apellido <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="lastName"
                                placeholder="Ej: García Márquez"
                                value={formData.lastName}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        lastName: e.target.value,
                                    })
                                }
                                required
                            />
                        </div>

                        {/* Foto del autor */}
                        <div className="space-y-2">
                            <Label htmlFor="authorImage">
                                Fotografía del Autor (opcional)
                            </Label>
                            {!previewUrl ? (
                                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                                    <input
                                        id="authorImage"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                    <label
                                        htmlFor="authorImage"
                                        className="cursor-pointer flex flex-col items-center gap-2"
                                    >
                                        <Avatar className="h-24 w-24">
                                            <AvatarFallback className="text-2xl bg-blue-500 text-white">
                                                {getInitials() || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="text-sm">
                                            <span className="font-semibold text-primary">
                                                Haz clic para subir
                                            </span>{' '}
                                            <span className="text-muted-foreground">
                                                o arrastra y suelta
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            PNG, JPG o WEBP (máx. 5MB)
                                        </p>
                                    </label>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-4 p-6 border-2 rounded-lg">
                                    <div className="relative">
                                        <Avatar className="h-32 w-32">
                                            <AvatarImage
                                                src={previewUrl}
                                                alt="Vista previa"
                                            />
                                            <AvatarFallback>
                                                {getInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon-sm"
                                            className="absolute -top-2 -right-2"
                                            onClick={handleRemoveImage}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {authorImage?.name}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Estado */}
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="status">Estado</Label>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Define si el autor está activo o inactivo.
                                </p>
                            </div>
                            <Switch
                                id="status"
                                checked={formData.status}
                                onCheckedChange={(value) =>
                                    setFormData({ ...formData, status: value })
                                }
                            />
                        </div>

                        {/* Botones */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/panel/autores')}
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
                                {loading ? 'Creando...' : 'Crear Autor'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

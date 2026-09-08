import { Form, Head } from '@inertiajs/react';
import { ImagePlus, RefreshCcw, Trash2, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';
import BrandingController from '@/actions/App/Http/Controllers/Settings/BrandingController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/branding';

type BrandingTeam = {
    id: number;
    name: string;
    slug: string;
    logoUrl?: string | null;
};

type Props = {
    team: BrandingTeam;
    canUpdateBranding: boolean;
};

export default function Branding({ team, canUpdateBranding }: Props) {
    const [preview, setPreview] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const hasSelectedFile = preview !== null;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleClearSelection = () => {
        if (inputRef.current) inputRef.current.value = '';

        setPreview(null);
    };

    return (
        <>
            <Head title="Branding settings" />
            <h1 className="sr-only">Branding settings</h1>
            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Branding"
                    description="Personaliza el logotipo que se muestra en tu punto de venta"
                />
                {canUpdateBranding ? (
                    <Form
                        {...BrandingController.update.form()}
                        options={{ preserveScroll: true }}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="logo">Logotipo</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="bg-muted flex aspect-square size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border">
                                            {preview ? (
                                                <img
                                                    src={preview}
                                                    alt="Vista previa"
                                                    className="size-full object-contain p-1"
                                                />
                                            ) : team.logoUrl ? (
                                                <img
                                                    src={team.logoUrl}
                                                    alt={team.name}
                                                    className="size-full object-contain p-1"
                                                />
                                            ) : (
                                                <ImagePlus className="text-muted-foreground size-7" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <label
                                                    htmlFor="logo"
                                                    className="focus-visible:ring-ring inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:outline-none"
                                                >
                                                    <UploadCloud className="size-4" />
                                                    {team.logoUrl
                                                        ? 'Cambiar logo'
                                                        : 'Subir logo'}
                                                </label>
                                                {hasSelectedFile ? (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={handleClearSelection}
                                                    >
                                                        <RefreshCcw className="size-4" />
                                                        Cancelar
                                                    </Button>
                                                ) : null}
                                            </div>
                                            <Input
                                                ref={inputRef}
                                                id="logo"
                                                name="logo"
                                                type="file"
                                                accept="image/png,image/jpeg,image/webp"
                                                className="sr-only"
                                                onChange={handleFileChange}
                                            />
                                            <p className="text-muted-foreground text-xs">
                                                PNG, JPG o WebP. Máximo 2 MB.
                                            </p>
                                        </div>
                                    </div>
                                    <InputError
                                        className="mt-2"
                                        message={errors.logo}
                                    />
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button disabled={processing}>
                                        Guardar logo
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                ) : (
                    <p className="text-muted-foreground text-sm">
                        No tienes permisos para actualizar la imagen de la marca.
                    </p>
                )}

                {canUpdateBranding && team.logoUrl && !hasSelectedFile ? (
                    <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                        <div className="space-y-0.5 text-red-600 dark:text-red-100">
                            <p className="font-medium">Eliminar logotipo</p>
                            <p className="text-sm">
                                Se restaurará el logotipo predeterminado.
                            </p>
                        </div>

                        <Form
                            {...BrandingController.destroy.form()}
                            options={{ preserveScroll: true }}
                        >
                            <Button type="submit" variant="destructive">
                                <Trash2 className="size-4" />
                                Quitar logo
                            </Button>
                        </Form>
                    </div>
                ) : null}
            </div>
        </>
    );
}

Branding.layout = {
    breadcrumbs: [
        {
            title: 'Branding settings',
            href: edit(),
        },
    ],
};
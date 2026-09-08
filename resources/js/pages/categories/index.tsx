import { Form, Head } from '@inertiajs/react';
import { Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { destroy, index, store, update } from '@/routes/categories';
import type { Team } from '@/types';

type Category = {
    id: number;
    name: string;
    slug: string;
    products_count: number;
};

type Props = {
    categories: Category[];
    currentTeam?: Team | null;
};

export default function CategoriesIndex({ categories, currentTeam }: Props) {
    const slug = currentTeam?.slug ?? '';
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

    return (
        <>
            <Head title="Categorías" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <h1 className="text-3xl font-semibold">Categorías</h1>
                <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_320px]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Categorías creadas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {categories.map((category) => (
                                <div className="flex items-center justify-between border-b pb-3 last:border-0" key={category.id}>
                                    <div className="flex flex-col">
                                        <span>{category.name}</span>
                                        <span className="text-muted-foreground text-xs">{category.slug}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground text-sm">{category.products_count} productos</span>
                                        <Button variant="ghost" size="icon" aria-label={`Editar ${category.name}`} onClick={() => setEditingCategory(category)}>
                                            <Edit className="size-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" aria-label={`Eliminar ${category.name}`} onClick={() => setCategoryToDelete(category)}>
                                            <Trash2 className="text-destructive size-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {categories.length === 0 && (
                                <p className="text-muted-foreground py-8 text-center">No hay categorías creadas.</p>
                            )}
                        </CardContent>
                    </Card>
                    <div className="space-y-6">
                        {editingCategory ? (
                            <Card>
                                <CardHeader><CardTitle>Editar categoría</CardTitle></CardHeader>
                                <CardContent>
                                    <Form {...update.form([slug, editingCategory.id])} onSuccess={() => setEditingCategory(null)} className="grid gap-3">
                                        {({ errors, processing }) => (
                                            <>
                                                <Input name="name" placeholder="Nombre" required defaultValue={editingCategory.name} />
                                                {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                                                <Input name="slug" placeholder="Slug (opcional)" defaultValue={editingCategory.slug} />
                                                {errors.slug && <p className="text-destructive text-sm">{errors.slug}</p>}
                                                <div className="flex gap-3">
                                                    <Button type="button" variant="outline" onClick={() => setEditingCategory(null)} disabled={processing}>Cancelar</Button>
                                                    <Button type="submit" disabled={processing}>{processing ? 'Actualizando...' : 'Actualizar categoría'}</Button>
                                                </div>
                                            </>
                                        )}
                                    </Form>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card id="nueva-categoria">
                                <CardHeader><CardTitle>Nueva categoría</CardTitle></CardHeader>
                                <CardContent>
                                    <Form {...store.form(slug)} resetOnSuccess className="grid gap-3">
                                        {({ errors, processing }) => (
                                            <>
                                                <Input name="name" placeholder="Nombre" required />
                                                {errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
                                                <Input name="slug" placeholder="Slug (opcional)" />
                                                {errors.slug && <p className="text-destructive text-sm">{errors.slug}</p>}
                                                <Button type="submit" disabled={processing}>{processing ? 'Guardando...' : 'Guardar'}</Button>
                                            </>
                                        )}
                                    </Form>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {categoryToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setCategoryToDelete(null)}>
                    <div className="bg-background w-full max-w-md rounded-xl border p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">¿Eliminar categoría?</h2>
                            <p className="text-muted-foreground text-sm">
                                ¿Estás seguro de que deseas eliminar la categoría{' '}
                                <span className="text-foreground font-semibold">"{categoryToDelete.name}"</span>?
                            </p>
                            <p className="text-muted-foreground text-sm">Esta acción no se puede deshacer.</p>
                        </div>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setCategoryToDelete(null)}>Cancelar</Button>
                            <Form action={destroy.url([slug, categoryToDelete.id])} method="delete">
                                <Button type="submit" variant="destructive" onClick={() => setCategoryToDelete(null)}>
                                    <Trash2 className="size-4" /> Eliminar
                                </Button>
                            </Form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

CategoriesIndex.layout = (props: { currentTeam?: Team | null }) => ({
    breadcrumbs: [{ title: 'Categorías', href: props.currentTeam ? index(props.currentTeam.slug) : '/' }],
});

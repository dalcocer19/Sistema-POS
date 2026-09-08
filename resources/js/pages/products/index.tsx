import { Form, Head, Link } from '@inertiajs/react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { store, index, destroy, update } from '@/routes/products';
import type { Team } from '@/types';

type Product = {
    id: number;
    category_id?: number | null;
    name: string;
    sku: string;
    barcode?: string | null;
    sale_price: string;
    cost_price?: string | null;
    stock: number;
    minimum_stock?: number | null;
    is_active: boolean;
    expiration_date?: string | null;
    category?: { id: number; name: string } | null;
};

type Props = {
    products: { data: Product[]; links: unknown[] };
    categories: Array<{ id: number; name: string }>;
    filter?: string;
    currentTeam?: Team | null;
};

const money = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
});

function getExpirationBadge(expirationDate?: string | null) {
    if (!expirationDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(expirationDate + 'T00:00:00');
    const diffTime = exp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return (
            <Badge variant="destructive">
                Vencido ({expirationDate})
            </Badge>
        );
    }
    if (diffDays === 0) {
        return (
            <Badge
                variant="destructive"
                className="bg-amber-600 hover:bg-amber-700"
            >
                Vence hoy ({expirationDate})
            </Badge>
        );
    }
    if (diffDays === 1) {
        return (
            <Badge
                variant="secondary"
                className="border border-amber-300 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
            >
                Vence mañana ({expirationDate})
            </Badge>
        );
    }
    if (diffDays <= 7) {
        return (
            <Badge
                variant="outline"
                className="border-amber-500/40 text-amber-600 dark:text-amber-400"
            >
                Vence en {diffDays} días ({expirationDate})
            </Badge>
        );
    }
    return (
        <Badge
            variant="outline"
            className="text-muted-foreground text-xs font-normal"
        >
            Vence: {expirationDate}
        </Badge>
    );
}

export default function ProductsIndex({
    products,
    categories,
    filter = 'all',
    currentTeam,
}: Props) {
    const [search, setSearch] = useState('');
    const [productToDelete, setProductToDelete] =
        useState<Product | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [showEditForm, setShowEditForm] = useState(false);

    const slug = currentTeam?.slug ?? '';

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setShowEditForm(true);
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
        setShowEditForm(false);
    };

    return (
        <>
            <Head title="Productos" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-muted-foreground text-sm">
                            Catálogo
                        </p>

                        <h1 className="text-3xl font-semibold">
                            Productos
                        </h1>
                    </div>

                    <Button asChild>
                        <Link href="#nuevo-producto">
                            <Plus /> Nuevo producto
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <Card>
                        <CardHeader className="space-y-3">
                            <CardTitle>Catálogo activo</CardTitle>

                            <Form
                                action={index.url(slug)}
                                method="get"
                                className="relative"
                            >
                                <Search className="text-muted-foreground absolute top-2.5 left-3 size-4" />

                                <Input
                                    name="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Buscar por nombre, SKU o código"
                                    className="pl-9"
                                />
                            </Form>

                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                <Button
                                    asChild
                                    variant={
                                        !filter || filter === 'all'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                >
                                    <Link href={index.url(slug)}>Todos</Link>
                                </Button>
                                <Button
                                    asChild
                                    variant={
                                        filter === 'expiring_soon'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                >
                                    <Link
                                        href={`${index.url(slug)}?filter=expiring_soon`}
                                    >
                                        Por vencer (7 días)
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant={
                                        filter === 'expired'
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                >
                                    <Link
                                        href={`${index.url(slug)}?filter=expired`}
                                    >
                                        Vencidos
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {products.data.map((product) => (
                                <div
                                    className="flex items-center justify-between gap-3 border-b pb-3 last:border-0"
                                    key={product.id}
                                >
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="truncate font-medium">
                                                {product.name}
                                            </p>
                                            {getExpirationBadge(
                                                product.expiration_date,
                                            )}
                                        </div>

                                        <p className="text-muted-foreground text-sm">
                                            {product.sku} ·{' '}
                                            {product.category?.name ??
                                                'Sin categoría'}{' '}
                                            · stock {product.stock}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold">
                                            {money.format(
                                                Number(product.sale_price),
                                            )}
                                        </span>

                                        {/* BOTÓN EDITAR */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEditProduct(product)}
                                            aria-label={`Editar ${product.name}`}
                                        >
                                            <Edit className="size-4" />
                                        </Button>

                                        {/* BOTÓN ELIMINAR */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Eliminar ${product.name}`}
                                            onClick={() =>
                                                setProductToDelete(product)
                                            }
                                        >
                                            <Trash2 className="text-destructive size-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            {products.data.length === 0 && (
                                <p className="text-muted-foreground py-8 text-center">
                                    No hay productos que coincidan.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        {showEditForm && editingProduct ? (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Editar producto</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Form
                                        {...update.form([slug, editingProduct.id])}
                                        onSuccess={handleCancelEdit}
                                        className="grid gap-3"
                                    >
                                        {({ errors, processing }) => (
                                            <>
                                                <Input
                                                    name="name"
                                                    placeholder="Nombre del producto"
                                                    required
                                                    defaultValue={editingProduct.name}
                                                />

                                                {errors.name && (
                                                    <p className="text-destructive text-sm">
                                                        {errors.name}
                                                    </p>
                                                )}

                                                <Input
                                                    name="sku"
                                                    placeholder="SKU"
                                                    required
                                                    defaultValue={editingProduct.sku}
                                                />

                                                <Input
                                                    name="barcode"
                                                    placeholder="Código de barras (opcional)"
                                                    defaultValue={editingProduct.barcode || ''}
                                                />

                                                <Input
                                                    name="sale_price"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="Precio de venta"
                                                    required
                                                    defaultValue={editingProduct.sale_price}
                                                />

                                                <Input
                                                    name="cost_price"
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="Costo (opcional)"
                                                    defaultValue={editingProduct.cost_price || ''}
                                                />

                                                <Input
                                                    name="stock"
                                                    type="number"
                                                    min="0"
                                                    placeholder="Stock"
                                                    required
                                                    defaultValue={editingProduct.stock}
                                                />

                                                <Input
                                                    name="minimum_stock"
                                                    type="number"
                                                    min="0"
                                                    placeholder="Stock mínimo (opcional)"
                                                    defaultValue={editingProduct.minimum_stock || ''}
                                                />

                                                <div className="space-y-1">
                                                    <label className="text-muted-foreground text-xs">
                                                        Fecha de vencimiento (opcional)
                                                    </label>
                                                    <Input
                                                        name="expiration_date"
                                                        type="date"
                                                        defaultValue={editingProduct.expiration_date || ''}
                                                    />
                                                </div>

                                                <select
                                                    name="category_id"
                                                    className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                                    defaultValue={editingProduct.category_id || editingProduct.category?.id || ''}
                                                >
                                                    <option value="">
                                                        Sin categoría
                                                    </option>

                                                    {categories.map((category) => (
                                                        <option
                                                            value={category.id}
                                                            key={category.id}
                                                        >
                                                            {category.name}
                                                        </option>
                                                    ))}
                                                </select>

                                                <div className="flex gap-3">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={handleCancelEdit}
                                                        disabled={processing}
                                                    >
                                                        Cancelar
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={processing}
                                                    >
                                                        {processing
                                                            ? 'Actualizando...'
                                                            : 'Actualizar producto'}
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </Form>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card id="nuevo-producto">
                                <CardHeader>
                                    <CardTitle>Alta manual</CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <Form
                                        {...store.form(slug)}
                                        resetOnSuccess
                                        className="grid gap-3"
                                    >
                                {({ errors, processing }) => (
                                    <>
                                        <Input
                                            name="name"
                                            placeholder="Nombre del producto"
                                            required
                                        />

                                        {errors.name && (
                                            <p className="text-destructive text-sm">
                                                {errors.name}
                                            </p>
                                        )}

                                        <Input
                                            name="sku"
                                            placeholder="SKU"
                                            required
                                        />

                                        <Input
                                            name="barcode"
                                            placeholder="Código de barras (opcional)"
                                        />

                                        <Input
                                            name="sale_price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="Precio de venta"
                                            required
                                        />

                                        <Input
                                            name="cost_price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="Costo (opcional)"
                                        />

                                        <Input
                                            name="stock"
                                            type="number"
                                            min="0"
                                            placeholder="Stock"
                                            required
                                        />

                                        <div className="space-y-1">
                                            <label className="text-muted-foreground text-xs">
                                                Fecha de vencimiento (opcional)
                                            </label>
                                            <Input
                                                name="expiration_date"
                                                type="date"
                                            />
                                        </div>

                                        <select
                                            name="category_id"
                                            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                        >
                                            <option value="">
                                                Sin categoría
                                            </option>

                                            {categories.map((category) => (
                                                <option
                                                    value={category.id}
                                                    key={category.id}
                                                >
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>

                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Guardando...'
                                                : 'Guardar producto'}
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* ========================= */}
            {/* MODAL CONFIRMAR ELIMINACIÓN */}
            {/* ========================= */}

            {productToDelete && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setProductToDelete(null)}
                >
                    <div
                        className="bg-background w-full max-w-md rounded-xl border p-6 shadow-xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold">
                                ¿Eliminar producto?
                            </h2>

                            <p className="text-muted-foreground text-sm">
                                ¿Estás seguro de que deseas eliminar el
                                producto{' '}
                                <span className="text-foreground font-semibold">
                                    "{productToDelete.name}"
                                </span>
                                ?
                            </p>

                            <p className="text-muted-foreground text-sm">
                                Esta acción no se puede deshacer.
                            </p>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            {/* CANCELAR */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setProductToDelete(null)}
                            >
                                Cancelar
                            </Button>

                            {/* CONFIRMAR ELIMINACIÓN */}
                            <Form
                                action={destroy.url([
                                    slug,
                                    productToDelete.id,
                                ])}
                                method="delete"
                            >
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    onClick={() =>
                                        setProductToDelete(null)
                                    }
                                >
                                    <Trash2 className="size-4" />
                                    Eliminar
                                </Button>
                            </Form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

ProductsIndex.layout = (props: { currentTeam?: Team | null }) => ({
    breadcrumbs: [
        {
            title: 'Productos',
            href: props.currentTeam
                ? index(props.currentTeam.slug)
                : '/',
        },
    ],
});


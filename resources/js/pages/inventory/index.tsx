import { Form, Head } from '@inertiajs/react';
import { PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { index, store } from '@/routes/inventory';
import type { Team } from '@/types';

type Product = {
    id: number;
    name: string;
    sku: string;
    stock: string;
    minimum_stock: string;
};
type Props = { products: Product[]; currentTeam?: Team | null };

export default function InventoryIndex({ products, currentTeam }: Props) {
    const slug = currentTeam?.slug ?? '';
    return (
        <>
            <Head title="Inventario" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <p className="text-muted-foreground text-sm">Existencias</p>
                    <h1 className="text-3xl font-semibold">Inventario</h1>
                </div>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Stock actual</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {products.map((product) => (
                                <div
                                    className="flex items-center justify-between border-b pb-3 last:border-0"
                                    key={product.id}
                                >
                                    <div>
                                        <p className="font-medium">
                                            {product.name}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            {product.sku}
                                        </p>
                                    </div>
                                    <p
                                        className={
                                            Number(product.stock) <=
                                            Number(product.minimum_stock)
                                                ? 'text-destructive font-semibold'
                                                : 'font-semibold'
                                        }
                                    >
                                        {product.stock} unidades
                                    </p>
                                </div>
                            ))}
                            {products.length === 0 && (
                                <p className="text-muted-foreground py-8 text-center">
                                    Crea productos para comenzar.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PackagePlus className="size-4" /> Entrada de
                                stock
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Form
                                {...store.form(slug)}
                                resetOnSuccess
                                className="grid gap-3"
                            >
                                {({ errors, processing }) => (
                                    <>
                                        <select
                                            name="product_id"
                                            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                            required
                                        >
                                            <option value="">
                                                Selecciona un producto
                                            </option>
                                            {products.map((product) => (
                                                <option
                                                    value={product.id}
                                                    key={product.id}
                                                >
                                                    {product.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.product_id && (
                                            <p className="text-destructive text-sm">
                                                {errors.product_id}
                                            </p>
                                        )}
                                        <Input
                                            name="quantity"
                                            type="number"
                                            step="0.001"
                                            min="0.001"
                                            placeholder="Cantidad"
                                            required
                                        />
                                        <select
                                            name="type"
                                            className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                                        >
                                            <option value="entry">
                                                Entrada de compra
                                            </option>
                                            <option value="adjustment">
                                                Ajuste positivo
                                            </option>
                                        </select>
                                        <Input
                                            name="reason"
                                            placeholder="Motivo (opcional)"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? 'Registrando...'
                                                : 'Registrar entrada'}
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

InventoryIndex.layout = (props: { currentTeam?: Team | null }) => ({
    breadcrumbs: [
        {
            title: 'Inventario',
            href: props.currentTeam ? index(props.currentTeam.slug) : '/',
        },
    ],
});

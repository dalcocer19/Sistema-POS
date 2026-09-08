import { Form, Head } from '@inertiajs/react';
import { Minus, Plus, ScanBarcode, ShoppingCart, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { create } from '@/routes/pos';
import { store } from '@/routes/sales';
import type { Team } from '@/types';

type Product = {
    id: number;
    name: string;
    sku: string;
    barcode?: string | null;
    sale_price: string;
    stock: string;
};

type Props = {
    products: Product[];
    currentTeam?: Team | null;
};

const money = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
});

export default function PosIndex({ products, currentTeam }: Props) {
    const [cart, setCart] = useState<Record<number, number>>({});
    const [search, setSearch] = useState('');
    const [amountReceived, setAmountReceived] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');

    const slug = currentTeam?.slug ?? '';

    const visibleProducts = products.filter((product) =>
        `${product.name} ${product.sku} ${product.barcode ?? ''}`
            .toLowerCase()
            .includes(search.toLowerCase()),
    );

    const total = useMemo(
        () =>
            products.reduce(
                (sum, product) =>
                    sum +
                    (cart[product.id] ?? 0) *
                        Number(product.sale_price),
                0,
            ),
        [cart, products],
    );

    const totalItems = useMemo(
        () =>
            Object.values(cart).reduce(
                (sum, quantity) => sum + quantity,
                0,
            ),
        [cart],
    );

    /*
     * Calculamos el cambio/vuelto.
     *
     * Solo se calcula cuando el método de pago
     * es efectivo.
     */
    const change = useMemo(() => {
        if (paymentMethod !== 'cash') {
            return 0;
        }

        const received = Number(amountReceived) || 0;

        return Math.max(received - total, 0);
    }, [amountReceived, total, paymentMethod]);

    /*
     * Calculamos si el dinero recibido
     * no alcanza para cubrir el total.
     */
    const missingAmount = useMemo(() => {
        if (paymentMethod !== 'cash') {
            return 0;
        }

        const received = Number(amountReceived) || 0;

        return Math.max(total - received, 0);
    }, [amountReceived, total, paymentMethod]);

    const add = (product: Product) =>
        setCart((current) => ({
            ...current,
            [product.id]: Math.min(
                (current[product.id] ?? 0) + 1,
                Number(product.stock),
            ),
        }));

    const productsByBarcode = useMemo(() => {
        const byCode = new Map<string, Product>();

        products.forEach((product) => {
            const code = product.barcode?.trim();

            if (code) {
                byCode.set(code, product);
            }
        });

        return byCode;
    }, [products]);

    const productsByBarcodeRef = useRef(productsByBarcode);
    productsByBarcodeRef.current = productsByBarcode;

    /*
     * Escucha el lector de código de barras físico (funciona como
     * un teclado "wedge"). Cuando se escanea un código, se busca el
     * producto correspondiente y se agrega al carrito automáticamente.
     */
    useBarcodeScanner({
        onScan: (code) => {
            const product = productsByBarcodeRef.current.get(code);

            if (!product) {
                toast.error(`Código de barras no encontrado: ${code}`, {
                    description: 'Verificá que el producto tenga asociado ese código.',
                });

                return;
            }

            if (Number(product.stock) <= 0) {
                toast.error(`${product.name} no tiene stock disponible`);

                return;
            }

            add(product);

            // Si el código quedó escrito en el buscador (porque el lector
            // escribe caracteres), se limpia para restaurar la lista.
            setSearch((current) => (current === code ? '' : current));

            toast.success(`${product.name} agregado al carrito`);
        },
    });

    const remove = (product: Product) =>
        setCart((current) => {
            const next = {
                ...current,
                [product.id]: (current[product.id] ?? 0) - 1,
            };

            if (next[product.id] <= 0) {
                delete next[product.id];
            }

            return next;
        });

    const clearProduct = (product: Product) =>
        setCart((current) => {
            const next = { ...current };
            delete next[product.id];
            return next;
        });

    const clearCart = () => setCart({});

    return (
        <>
            <Head title="Nueva venta" />

            <div className="flex flex-col gap-6 p-4 md:p-6">
                {/* ENCABEZADO */}
                <div>
                    <p className="text-muted-foreground text-sm font-medium">
                        Caja
                    </p>

                    {/* <h1 className="text-3xl font-semibold tracking-tight">
                        Nueva venta
                    </h1> */}
                </div>

                <Form {...store.form(slug)} resetOnSuccess>
                    {({ processing, errors }) => (
                        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_430px]">

                            {/* ========================= */}
                            {/* COLUMNA PRINCIPAL */}
                            {/* ========================= */}

                            <div className="flex flex-col gap-6">

                                {/* ========================= */}
                                {/* CARRITO */}
                                {/* ========================= */}

                                <Card className="overflow-hidden">
                                    <CardHeader className="border-b bg-muted/20 px-4 py-3 sm:px-6 sm:py-4">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-lg font-semibold sm:text-xl">
                                                <ShoppingCart className="text-primary size-5" />

                                                <span>Carrito</span>

                                                {totalItems > 0 && (
                                                    <span className="bg-primary/10 text-primary border-primary/20 rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                                                        {totalItems}{' '}
                                                        {totalItems === 1
                                                            ? 'producto'
                                                            : 'productos'}
                                                    </span>
                                                )}
                                            </CardTitle>

                                            {totalItems > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-muted-foreground hover:text-destructive h-8 px-2 text-xs"
                                                    onClick={clearCart}
                                                >
                                                    <Trash2 className="mr-1 size-3.5" />
                                                    Vaciar
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-0">
                                        {/* PRODUCTOS DEL CARRITO */}

                                        <div className="max-h-[440px] space-y-2.5 overflow-y-auto p-4">
                                            {products
                                                .filter(
                                                    (product) =>
                                                        cart[product.id],
                                                )
                                                .map((product, index) => {
                                                    const quantity =
                                                        cart[product.id];
                                                    const unitPrice = Number(
                                                        product.sale_price,
                                                    );
                                                    const lineSubtotal =
                                                        unitPrice * quantity;
                                                    const isMaxStock =
                                                        quantity >=
                                                        Number(product.stock);

                                                    return (
                                                        <div
                                                            key={product.id}
                                                            className="group relative flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3.5 shadow-xs transition-all hover:border-primary/40 hover:bg-accent/20 hover:shadow-sm dark:border-border/60 dark:bg-card/50"
                                                        >
                                                            {/* Indicador de acento visual a la izquierda */}
                                                            <div className="bg-primary/60 absolute bottom-2.5 left-0 top-2.5 w-1 rounded-r-full transition-all group-hover:bg-primary" />

                                                            <div className="min-w-0 flex-1 pl-1.5">
                                                                <p className="truncate text-sm font-semibold text-foreground">
                                                                    {product.name}
                                                                </p>

                                                                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                                                                    <span className="text-muted-foreground">
                                                                        {money.format(
                                                                            unitPrice,
                                                                        )}{' '}
                                                                        c/u
                                                                    </span>

                                                                    <span className="text-muted-foreground/40">
                                                                        •
                                                                    </span>

                                                                    <span className="font-semibold text-primary">
                                                                        Subtotal:{' '}
                                                                        {money.format(
                                                                            lineSubtotal,
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                <input
                                                                    type="hidden"
                                                                    name={`items[${index}][product_id]`}
                                                                    value={
                                                                        product.id
                                                                    }
                                                                />

                                                                <input
                                                                    type="hidden"
                                                                    name={`items[${index}][quantity]`}
                                                                    value={
                                                                        quantity
                                                                    }
                                                                />
                                                            </div>

                                                            <div className="flex shrink-0 items-center gap-2">
                                                                {/* Selector de cantidad */}
                                                                <div className="flex items-center rounded-lg border border-border/80 bg-muted/40 p-0.5 shadow-2xs dark:bg-muted/20">
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="size-7 rounded-md text-foreground/80 hover:bg-background hover:text-foreground hover:shadow-2xs"
                                                                        onClick={() =>
                                                                            remove(
                                                                                product,
                                                                            )
                                                                        }
                                                                        title="Disminuir"
                                                                    >
                                                                        <Minus className="size-3.5" />
                                                                    </Button>

                                                                    <span className="w-8 text-center text-sm font-bold tabular-nums text-foreground">
                                                                        {quantity}
                                                                    </span>

                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="size-7 rounded-md text-foreground/80 hover:bg-background hover:text-foreground hover:shadow-2xs disabled:opacity-40"
                                                                        disabled={
                                                                            isMaxStock
                                                                        }
                                                                        onClick={() =>
                                                                            add(
                                                                                product,
                                                                            )
                                                                        }
                                                                        title={
                                                                            isMaxStock
                                                                                ? 'Stock máximo alcanzado'
                                                                                : 'Aumentar'
                                                                        }
                                                                    >
                                                                        <Plus className="size-3.5" />
                                                                    </Button>
                                                                </div>

                                                                {/* Botón eliminar item */}
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="text-muted-foreground/70 hover:bg-destructive/10 hover:text-destructive size-8 transition-colors"
                                                                    onClick={() =>
                                                                        clearProduct(
                                                                            product,
                                                                        )
                                                                    }
                                                                    title="Quitar producto"
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                            {Object.keys(cart).length === 0 && (
                                                <div className="flex min-h-40 flex-col items-center justify-center text-center">
                                                    <ShoppingCart className="text-muted-foreground mb-3 size-10" />

                                                    <p className="text-muted-foreground text-sm">
                                                        El carrito está vacío
                                                    </p>

                                                    <p className="text-muted-foreground mt-1 text-xs">
                                                        Agrega productos para
                                                        comenzar.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* ========================= */}
                                {/* PRODUCTOS DISPONIBLES */}
                                {/* ========================= */}

                                <Card className="overflow-hidden">
                                    <CardHeader className="border-b">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-xl">
                                                        Productos disponibles
                                                    </CardTitle>

                                                    <p className="text-muted-foreground mt-1 text-sm">
                                                        Selecciona un producto
                                                        para agregarlo a la
                                                        venta.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="relative">
                                                <ScanBarcode className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />

                                                <Input
                                                    value={search}
                                                    onChange={(event) =>
                                                        setSearch(
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Buscar, escribir o escanear código..."
                                                    className="h-11 pl-9"
                                                />
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="grid gap-3 p-4 sm:grid-cols-2">
                                        {visibleProducts.map((product) => {
                                            const quantity =
                                                cart[product.id] ?? 0;

                                            return (
                                                <button
                                                    type="button"
                                                    key={product.id}
                                                    onClick={() =>
                                                        add(product)
                                                    }
                                                    disabled={
                                                        Number(
                                                            product.stock,
                                                        ) <= 0
                                                    }
                                                    className="border-border bg-background hover:border-primary hover:bg-muted/30 group flex min-h-32 flex-col justify-between rounded-xl border p-4 text-left transition-all hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <span className="line-clamp-2 font-medium">
                                                            {product.name}
                                                        </span>

                                                        {quantity > 0 && (
                                                            <span className="bg-primary text-primary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                                                                {quantity}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <span className="text-muted-foreground block text-xs">
                                                            {product.sku} · stock{' '}
                                                            {product.stock}
                                                        </span>

                                                        <span className="text-primary block text-lg font-bold">
                                                            {money.format(
                                                                Number(
                                                                    product.sale_price,
                                                                ),
                                                            )}
                                                        </span>
                                                    </div>
                                                </button>
                                            );
                                        })}

                                        {visibleProducts.length === 0 && (
                                            <p className="text-muted-foreground col-span-full py-12 text-center">
                                                No hay productos disponibles.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* ========================= */}
                            {/* COLUMNA DERECHA */}
                            {/* ========================= */}

                            <div className="flex flex-col gap-6">

                                {/* ========================= */}
                                {/* VENTA / PAGO */}
                                {/* ========================= */}

                                <div className="xl:sticky xl:top-6">
                                    <Card className="overflow-hidden">
                                        <CardHeader className="border-b">
                                            <CardTitle className="text-xl">
                                                Venta
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent className="p-5">

                                            {/* ========================= */}
                                            {/* TOTAL */}
                                            {/* ========================= */}

                                            <div className="mb-6 rounded-2xl border p-5 shadow-sm">
                                                <div className="mb-2 flex items-center justify-between">
                                                    <span className="text-muted-foreground text-sm font-medium uppercase tracking-wide">
                                                        Total a pagar
                                                    </span>

                                                    <ShoppingCart className="text-muted-foreground size-5" />
                                                </div>

                                                <div className="text-primary mt-1 text-left text-5xl font-bold tracking-tight">
                                                    {money.format(total)}
                                                </div>
                                            </div>

                                            {/* ========================= */}
                                            {/* MÉTODO DE PAGO */}
                                            {/* ========================= */}

                                            <div className="space-y-4">

                                                <div>
                                                    <label
                                                        htmlFor="payment_method"
                                                        className="mb-2 block text-sm font-medium"
                                                    >
                                                        Método de pago
                                                    </label>

                                                    <select
                                                        id="payment_method"
                                                        name="payment_method"
                                                        value={paymentMethod}
                                                        onChange={(event) =>
                                                            setPaymentMethod(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="border-input bg-background h-11 w-full rounded-md border px-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
                                                    >
                                                        <option value="cash">
                                                            Efectivo
                                                        </option>

                                                        <option value="card">
                                                            Tarjeta
                                                        </option>

                                                        <option value="other">
                                                            Otro
                                                        </option>
                                                    </select>
                                                </div>

                                                {/* ========================= */}
                                                {/* MONTO RECIBIDO */}
                                                {/* ========================= */}

                                                <div>
                                                    <label
                                                        htmlFor="amount_received"
                                                        className="mb-2 block text-sm font-medium"
                                                    >
                                                        Monto recibido
                                                    </label>

                                                    <Input
                                                        id="amount_received"
                                                        name="amount_received"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder="Ej: 100.00"
                                                        className="h-11"
                                                        value={
                                                            amountReceived
                                                        }
                                                        onChange={(event) =>
                                                            setAmountReceived(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>

                                                {/* ========================= */}
                                                {/* CAMBIO / VUELTO */}
                                                {/* ========================= */}

                                                {paymentMethod === 'cash' && (
                                                    <div
                                                        className={`rounded-xl border p-4 ${
                                                            missingAmount > 0
                                                                ? 'border-destructive/30 bg-destructive/5'
                                                                : 'bg-muted/30'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-muted-foreground text-sm font-medium">
                                                                {missingAmount >
                                                                0
                                                                    ? 'Falta'
                                                                    : 'Cambio / vuelto'}
                                                            </span>

                                                            <span
                                                                className={`text-xl font-bold ${
                                                                    missingAmount >
                                                                    0
                                                                        ? 'text-destructive'
                                                                        : 'text-primary'
                                                                }`}
                                                            >
                                                                {money.format(
                                                                    missingAmount >
                                                                        0
                                                                        ? missingAmount
                                                                        : change,
                                                                )}
                                                            </span>
                                                        </div>

                                                        {missingAmount > 0 && (
                                                            <p className="text-destructive mt-1 text-xs">
                                                                El monto
                                                                recibido no
                                                                alcanza para
                                                                cubrir el total.
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            {/* ========================= */}
                                            {/* ERRORES */}
                                            {/* ========================= */}

                                            {errors.items && (
                                                <p className="text-destructive mt-3 text-sm">
                                                    {errors.items}
                                                </p>
                                            )}

                                            {errors.amount_received && (
                                                <p className="text-destructive mt-3 text-sm">
                                                    {errors.amount_received}
                                                </p>
                                            )}

                                            {/* ========================= */}
                                            {/* BOTÓN CONFIRMAR */}
                                            {/* ========================= */}

                                            <Button
                                                className="mt-6 h-14 w-full text-base font-semibold"
                                                type="submit"
                                                disabled={
                                                    processing ||
                                                    Object.keys(cart)
                                                        .length === 0 ||
                                                    (paymentMethod === 'cash' &&
                                                        missingAmount > 0)
                                                }
                                            >
                                                {processing
                                                    ? 'Procesando...'
                                                    : 'Confirmar venta'}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}
                </Form>
            </div>
        </>
    );
}

PosIndex.layout = (props: { currentTeam?: Team | null }) => ({
    breadcrumbs: [
        {
            title: 'Nueva venta',
            href: props.currentTeam
                ? create(props.currentTeam.slug)
                : '/',
        },
    ],
});


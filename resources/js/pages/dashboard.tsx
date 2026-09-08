import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    CalendarClock,
    CircleAlert,
    Package,
    ShoppingCart,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';
import { index as inventoryIndex } from '@/routes/inventory';
import { create as posCreate } from '@/routes/pos';
import { index as productsIndex } from '@/routes/products';
import type { DashboardInvitation } from '@/types';

type ExpiringProduct = {
    id: number;
    name: string;
    sku: string;
    stock: number;
    expiration_date: string | null;
    is_expired: boolean;
    days_remaining: number;
};

type Props = {
    pendingInvitations?: DashboardInvitation[];
    metrics: {
        salesToday: number;
        revenueToday: number;
        activeProducts: number;
        lowStockProducts: number;
        expiringSoonProducts?: number;
        expiredProducts?: number;
    };
    expiringProducts?: ExpiringProduct[];
    recentSales?: Array<{
        id: number;
        number: string;
        total: string;
        payment_method: string;
        sold_at: string;
        user?: { name: string };
    }>;
    currentTeam?: { slug: string } | null;
};

const money = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
});

export default function Dashboard({
    pendingInvitations = [],
    metrics,
    expiringProducts = [],
    recentSales = [],
    currentTeam,
}: Props) {
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );
    const teamSlug = currentTeam?.slug ?? '';
    const totalExpiringAlerts =
        (metrics.expiringSoonProducts ?? 0) + (metrics.expiredProducts ?? 0);

    return (
        <>
            <Head title="Resumen" />
            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={showInvitations}
                onOpenChange={setShowInvitations}
            />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-muted-foreground text-sm">
                            Operación de hoy
                        </p>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Resumen de la despensa
                        </h1>
                    </div>
                    <Button asChild size="lg">
                        <Link href={posCreate(teamSlug)}>
                            <ShoppingCart className="mr-2 size-4" /> Nueva venta
                        </Link>
                    </Button>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-sm font-medium">
                                Ventas de hoy{' '}
                                <ShoppingCart className="text-primary size-4" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">
                                {metrics.salesToday}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                tickets registrados
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-sm font-medium">
                                Ingresos de hoy{' '}
                                <Wallet className="text-primary size-4" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">
                                {money.format(Number(metrics.revenueToday))}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                facturación del día
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-sm font-medium">
                                Productos Totales{' '}
                                <Package className="text-primary size-4" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">
                                {metrics.activeProducts}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                en el catálogo
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-sm font-medium">
                                Stock bajo{' '}
                                <CircleAlert className="text-destructive size-4" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-semibold">
                                {metrics.lowStockProducts}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                requieren reposición
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-sm font-medium">
                                Vencimientos{' '}
                                <CalendarClock
                                    className={`size-4 ${totalExpiringAlerts > 0 ? 'text-amber-500' : 'text-primary'}`}
                                />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p
                                className={`text-3xl font-semibold ${totalExpiringAlerts > 0 ? 'text-amber-600 dark:text-amber-400' : ''}`}
                            >
                                {totalExpiringAlerts}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {metrics.expiringSoonProducts ?? 0} por vencer ·{' '}
                                {metrics.expiredProducts ?? 0} vencidos
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Layout */}
                <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
                    <div className="flex flex-col gap-6">
                        {/* Ventas Recientes */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Ventas recientes</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {recentSales.length === 0 ? (
                                    <p className="text-muted-foreground py-8 text-center">
                                        Todavía no hay ventas registradas.
                                    </p>
                                ) : (
                                    recentSales.map((sale) => (
                                        <div
                                            className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                                            key={sale.id}
                                        >
                                            <div>
                                                <p className="font-medium">
                                                    {sale.number}
                                                </p>
                                                <p className="text-muted-foreground text-sm">
                                                    {sale.user?.name ?? 'Cajero'} ·{' '}
                                                    {sale.payment_method}
                                                </p>
                                            </div>
                                            <p className="font-semibold">
                                                {money.format(Number(sale.total))}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>

                        {/* Alertas de Vencimiento */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <CalendarClock className="size-5 text-amber-500" />
                                    Alertas de vencimiento (próximos 7 días)
                                </CardTitle>
                                <Button asChild variant="ghost" size="sm">
                                    <Link
                                        href={`${productsIndex(teamSlug)}?filter=expiring_soon`}
                                    >
                                        Ver productos <ArrowUpRight className="ml-1 size-4" />
                                    </Link>
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {expiringProducts.length === 0 ? (
                                    <p className="text-muted-foreground py-6 text-center text-sm">
                                        ¡Todo al día! No hay productos por vencer en los próximos 7 días.
                                    </p>
                                ) : (
                                    expiringProducts.map((product) => (
                                        <div
                                            className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                                            key={product.id}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium">
                                                    {product.name}
                                                </p>
                                                <p className="text-muted-foreground text-sm">
                                                    SKU: {product.sku} · Stock:{' '}
                                                    <span className="text-foreground font-medium">
                                                        {product.stock} un.
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                                {product.is_expired ? (
                                                    <Badge variant="destructive">
                                                        Vencido ({product.expiration_date})
                                                    </Badge>
                                                ) : product.days_remaining === 0 ? (
                                                    <Badge
                                                        variant="destructive"
                                                        className="bg-amber-600 hover:bg-amber-700"
                                                    >
                                                        Vence hoy ({product.expiration_date})
                                                    </Badge>
                                                ) : product.days_remaining === 1 ? (
                                                    <Badge
                                                        variant="secondary"
                                                        className="border border-amber-300 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                                                    >
                                                        Vence mañana ({product.expiration_date})
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="border-amber-500/40 text-amber-600 dark:text-amber-400"
                                                    >
                                                        Vence en {product.days_remaining} días ({product.expiration_date})
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Columna derecha: Accesos rápidos */}
                    <div className="flex flex-col gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Accesos rápidos</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="justify-between"
                                >
                                    <Link href={productsIndex(teamSlug)}>
                                        Gestionar productos <ArrowUpRight className="size-4" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="justify-between"
                                >
                                    <Link
                                        href={`${productsIndex(teamSlug)}?filter=expiring_soon`}
                                    >
                                        Productos por vencer <ArrowUpRight className="size-4" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="justify-between"
                                >
                                    <Link href={inventoryIndex(teamSlug)}>
                                        Registrar entrada de stock <ArrowUpRight className="size-4" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

// Configuración opcional para pasajes de props a layout persistente
Dashboard.layout = (page: React.ReactNode) => page;
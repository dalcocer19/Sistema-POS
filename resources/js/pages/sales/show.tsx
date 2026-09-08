import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index, show } from '@/routes/sales';
import type { Team } from '@/types';

type Sale = {
    number: string;
    subtotal: string;
    total: string;
    payment_method: string;
    amount_received?: string | null;
    change_due: string;
    sold_at: string;
    user?: { name: string };
    items: Array<{
        product_name: string;
        product_sku: string;
        quantity: string;
        unit_price: string;
        line_total: string;
    }>;
};
type Props = { sale: Sale; currentTeam?: Team | null };
const money = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
});

export default function SaleShow({ sale, currentTeam }: Props) {
    return (
        <>
            <Head title={`Ticket ${sale.number}`} />
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 md:p-8">
                <div className="flex items-center justify-between">
                    <Button asChild variant="ghost">
                        <Link href={index(currentTeam?.slug ?? '')}>
                            <ArrowLeft /> Volver a ventas
                        </Link>
                    </Button>
                    <Button variant="outline" onClick={() => window.print()}>
                        <Printer /> Imprimir
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex justify-between">
                            <span>{sale.number}</span>
                            <span>{money.format(Number(sale.total))}</span>
                        </CardTitle>
                        <p className="text-muted-foreground text-sm">
                            {new Date(sale.sold_at).toLocaleString('es-ES')} ·{' '}
                            {sale.user?.name ?? 'Cajero'}
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            {sale.items.map((item) => (
                                <div
                                    className="flex justify-between gap-4"
                                    key={`${item.product_sku}-${item.product_name}`}
                                >
                                    <div>
                                        <p>{item.product_name}</p>
                                        <p className="text-muted-foreground text-sm">
                                            {item.quantity} ×{' '}
                                            {money.format(
                                                Number(item.unit_price),
                                            )}
                                        </p>
                                    </div>
                                    <p className="font-medium">
                                        {money.format(Number(item.line_total))}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="border-t pt-4 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>
                                    {money.format(Number(sale.subtotal))}
                                </span>
                            </div>
                            <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span>{money.format(Number(sale.total))}</span>
                            </div>
                            {sale.payment_method === 'cash' && (
                                <div className="text-muted-foreground mt-2 flex justify-between">
                                    <span>Cambio</span>
                                    <span>
                                        {money.format(Number(sale.change_due))}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SaleShow.layout = (props: { currentTeam?: Team | null }) => ({
    breadcrumbs: [
        {
            title: 'Ticket',
            href: props.currentTeam ? show([props.currentTeam.slug, '']) : '/',
        },
    ],
});

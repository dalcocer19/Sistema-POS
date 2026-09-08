import { Head, Link } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { index, show } from '@/routes/sales';
import type { Team } from '@/types';

type Sale = {
    id: number;
    number: string;
    total: string;
    payment_method: string;
    sold_at: string;
    user?: { name: string };
};
type Props = { sales: { data: Sale[] }; currentTeam?: Team | null };
const money = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
});

export default function SalesIndex({ sales, currentTeam }: Props) {
    return (
        <>
            <Head title="Ventas" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <div>
                    <p className="text-muted-foreground text-sm">Historial</p>
                    <h1 className="text-3xl font-semibold">Ventas</h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Tickets registrados</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {sales.data.map((sale) => (
                            <div
                                className="flex items-center justify-between border-b pb-3 last:border-0"
                                key={sale.id}
                            >
                                <div>
                                    <p className="font-medium">{sale.number}</p>
                                    <p className="text-muted-foreground text-sm">
                                        {sale.user?.name ?? 'Cajero'} ·{' '}
                                        {sale.payment_method} ·{' '}
                                        {new Date(sale.sold_at).toLocaleString(
                                            'es-ES',
                                        )}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold">
                                        {money.format(Number(sale.total))}
                                    </span>
                                    <Button asChild variant="ghost" size="icon">
                                        <Link
                                            href={show([
                                                currentTeam?.slug ?? '',
                                                sale.id,
                                            ])}
                                        >
                                            <Eye />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {sales.data.length === 0 && (
                            <p className="text-muted-foreground py-8 text-center">
                                Todavía no hay ventas.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

SalesIndex.layout = (props: { currentTeam?: Team | null }) => ({
    breadcrumbs: [
        {
            title: 'Ventas',
            href: props.currentTeam ? index(props.currentTeam.slug) : '/',
        },
    ],
});

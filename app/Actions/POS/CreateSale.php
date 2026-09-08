<?php

namespace App\Actions\POS;

use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\Sale;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreateSale
{
    /**
     * @param  array{payment_method: string, amount_received?: string|int|float|null, items: array<int, array{product_id: int, quantity: string|int|float}>}  $data
     */
    public function handle(Team $team, User $user, array $data): Sale
    {
        return DB::transaction(function () use ($team, $user, $data): Sale {
            $itemsByProduct = collect($data['items'])->keyBy('product_id');
            $products = $team->products()
                ->whereIn('id', $itemsByProduct->keys())
                ->where('is_active', true)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            if ($products->count() !== $itemsByProduct->count()) {
                throw ValidationException::withMessages(['items' => 'Uno o más productos no están disponibles.']);
            }

            $lineData = [];
            $subtotalCents = 0;

            foreach ($itemsByProduct as $productId => $item) {
                /** @var Product $product */
                $product = $products->get($productId);
                $quantity = self::decimalToInteger((string) $item['quantity'], 3);
                $stock = self::decimalToInteger((string) $product->stock, 3);

                if ($quantity <= 0 || $stock < $quantity) {
                    throw ValidationException::withMessages([
                        'items' => "Stock insuficiente para {$product->name}.",
                    ]);
                }

                $unitPrice = self::decimalToInteger((string) $product->sale_price, 2);
                $lineTotal = intdiv($unitPrice * $quantity, 1000);
                $subtotalCents += $lineTotal;

                $lineData[] = [
                    'product' => $product,
                    'quantity' => $quantity,
                    'line_total' => $lineTotal,
                    'unit_price' => $unitPrice,
                ];
            }

            $amountReceived = $data['amount_received'] ?? null;
            $amountReceivedCents = $amountReceived === null ? null : self::decimalToInteger((string) $amountReceived, 2);

            if ($data['payment_method'] === 'cash' && ($amountReceivedCents === null || $amountReceivedCents < $subtotalCents)) {
                throw ValidationException::withMessages(['amount_received' => 'El efectivo recibido no cubre el total.']);
            }

            $changeDueCents = $data['payment_method'] === 'cash' ? $amountReceivedCents - $subtotalCents : 0;
            $sale = $team->sales()->create([
                'user_id' => $user->id,
                'number' => 'V-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4)),
                'subtotal' => self::integerToDecimal($subtotalCents, 2),
                'total' => self::integerToDecimal($subtotalCents, 2),
                'payment_method' => $data['payment_method'],
                'amount_received' => $amountReceivedCents === null ? null : self::integerToDecimal($amountReceivedCents, 2),
                'change_due' => self::integerToDecimal($changeDueCents, 2),
                'sold_at' => now(),
            ]);

            foreach ($lineData as $line) {
                /** @var Product $product */
                $product = $line['product'];
                $quantity = $line['quantity'] / 1000;
                $product->decrement('stock', $quantity);
                $sale->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_sku' => $product->sku,
                    'quantity' => $quantity,
                    'unit_price' => self::integerToDecimal($line['unit_price'], 2),
                    'line_total' => self::integerToDecimal($line['line_total'], 2),
                ]);
                InventoryMovement::create([
                    'team_id' => $team->id,
                    'product_id' => $product->id,
                    'user_id' => $user->id,
                    'sale_id' => $sale->id,
                    'type' => 'sale',
                    'quantity' => -$quantity,
                    'reason' => "Venta {$sale->number}",
                ]);
            }

            return $sale->load('items');
        });
    }

    private static function decimalToInteger(string $value, int $scale): int
    {
        [$whole, $fraction] = array_pad(explode('.', $value, 2), 2, '');
        $fraction = str_pad(substr($fraction, 0, $scale), $scale, '0');

        return ((int) $whole * (10 ** $scale)) + (int) $fraction;
    }

    private static function integerToDecimal(int $value, int $scale): string
    {
        $base = 10 ** $scale;

        return intdiv($value, $base).'.'.str_pad((string) ($value % $base), $scale, '0', STR_PAD_LEFT);
    }
}

<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrFail();
        $team = $user->currentTeam;

        if (! $team) {
            $this->command?->error('No se encontró un equipo.');

            return;
        }

        $categories = collect([
            'Bebidas' => 'bebidas',
            'Lácteos' => 'lacteos',
            'Snacks' => 'snacks',
            'Limpieza' => 'limpieza',
            'Panadería' => 'panaderia',
        ])->mapWithKeys(fn ($slug, $name) => [
            $name => Category::firstOrCreate(
                ['slug' => $slug, 'team_id' => $team->id],
                ['name' => $name],
            ),
        ]);

        $products = [
            [
                'name' => 'Coca-Cola 500ml',
                'sku' => 'COCA-500',
                'barcode' => '7790123456789',
                'sale_price' => 1500.00,
                'cost_price' => 900.00,
                'stock' => 48,
                'minimum_stock' => 12,
                'category_id' => $categories['Bebidas']->id,
                'expiration_date' => now()->addMonths(6)->toDateString(),
            ],
            [
                'name' => 'Agua Mineral 1.5L',
                'sku' => 'AGUA-1500',
                'barcode' => '7790987654321',
                'sale_price' => 1000.00,
                'cost_price' => 500.00,
                'stock' => 60,
                'minimum_stock' => 15,
                'category_id' => $categories['Bebidas']->id,
                'expiration_date' => now()->addMonths(9)->toDateString(),
            ],
            [
                'name' => 'Jugo de Naranja 1L',
                'sku' => 'JUGO-NAR-1L',
                'sale_price' => 1800.00,
                'cost_price' => 1100.00,
                'stock' => 24,
                'minimum_stock' => 8,
                'category_id' => $categories['Bebidas']->id,
                'expiration_date' => now()->addDays(5)->toDateString(),
            ],
            [
                'name' => 'Leche Entera 1L',
                'sku' => 'LECHE-ENT-1L',
                'barcode' => '7791234567890',
                'sale_price' => 1200.00,
                'cost_price' => 750.00,
                'stock' => 30,
                'minimum_stock' => 10,
                'category_id' => $categories['Lácteos']->id,
                'expiration_date' => now()->addDays(2)->toDateString(),
            ],
            [
                'name' => 'Yogur Natural x4',
                'sku' => 'YOG-NTX4',
                'sale_price' => 1600.00,
                'cost_price' => 1000.00,
                'stock' => 20,
                'minimum_stock' => 6,
                'category_id' => $categories['Lácteos']->id,
                'expiration_date' => now()->subDays(3)->toDateString(),
            ],
            [
                'name' => 'Queso Cremoso 500g',
                'sku' => 'Queso-CREM-500',
                'sale_price' => 3200.00,
                'cost_price' => 2200.00,
                'stock' => 15,
                'minimum_stock' => 5,
                'category_id' => $categories['Lácteos']->id,
                'expiration_date' => now()->addDays(1)->toDateString(),
            ],
            [
                'name' => 'Papas Fritas Clásicas 150g',
                'sku' => 'PAPAS-CL-150',
                'barcode' => '7791112223334',
                'sale_price' => 2000.00,
                'cost_price' => 1200.00,
                'stock' => 40,
                'minimum_stock' => 10,
                'category_id' => $categories['Snacks']->id,
                'expiration_date' => now()->addMonths(3)->toDateString(),
            ],
            [
                'name' => 'Alfajores x6',
                'sku' => 'ALFAJ-X6',
                'sale_price' => 2500.00,
                'cost_price' => 1500.00,
                'stock' => 0,
                'minimum_stock' => 8,
                'category_id' => $categories['Snacks']->id,
                'expiration_date' => now()->addDays(10)->toDateString(),
            ],
            [
                'name' => 'Detergente Líquido 1L',
                'sku' => 'DETER-1L',
                'barcode' => '7794445556667',
                'sale_price' => 1900.00,
                'cost_price' => 1100.00,
                'stock' => 35,
                'minimum_stock' => 10,
                'category_id' => $categories['Limpieza']->id,
                'expiration_date' => null,
            ],
            [
                'name' => 'Jabón en Barra x3',
                'sku' => 'JABON-X3',
                'sale_price' => 900.00,
                'cost_price' => 500.00,
                'stock' => 50,
                'minimum_stock' => 15,
                'category_id' => $categories['Limpieza']->id,
                'expiration_date' => null,
            ],
            [
                'name' => 'Pan Lactal 500g',
                'sku' => 'PAN-LACT-500',
                'sale_price' => 1400.00,
                'cost_price' => 800.00,
                'stock' => 18,
                'minimum_stock' => 6,
                'category_id' => $categories['Panadería']->id,
                'expiration_date' => now()->toDateString(),
            ],
            [
                'name' => 'Medialunas x12',
                'sku' => 'MEDIAL-X12',
                'sale_price' => 2800.00,
                'cost_price' => 1600.00,
                'stock' => 25,
                'minimum_stock' => 5,
                'category_id' => $categories['Panadería']->id,
                'expiration_date' => now()->subDays(10)->toDateString(),
            ],
        ];

        foreach ($products as $data) {
            Product::create(array_merge($data, [
                'team_id' => $team->id,
                'is_active' => true,
            ]));
        }

        $this->command?->info("Se crearon {$categories->count()} categorías y " . count($products) . " productos.");
    }
}

<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'category_id' => null,
            'name' => fake()->words(2, true),
            'sku' => fake()->unique()->lexify('SKU-??????'),
            'barcode' => fake()->optional()->ean13(),
            'sale_price' => fake()->randomFloat(2, 50, 1000),
            'cost_price' => fake()->optional()->randomFloat(2, 30, 800),
            'stock' => fake()->numberBetween(1, 100),
            'minimum_stock' => 5,
            'is_active' => true,
            'expiration_date' => null,
        ];
    }

    /**
     * Indicate that the product is expiring soon.
     */
    public function expiringSoon(int $days = 3): static
    {
        return $this->state(fn (array $attributes) => [
            'expiration_date' => now()->addDays($days)->toDateString(),
        ]);
    }

    /**
     * Indicate that the product is expired.
     */
    public function expired(int $days = 3): static
    {
        return $this->state(fn (array $attributes) => [
            'expiration_date' => now()->subDays($days)->toDateString(),
        ]);
    }
}


<?php

use App\Enums\TeamRole;
use App\Models\Category;
use App\Models\Product;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('the products index page can be rendered', function () {
    $user = User::factory()->create();
    $team = Team::factory()->personal()->create();
    $team->members()->attach($user, [
        'role' => TeamRole::Owner->value,
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('products.index', ['current_team' => $team]));

    $response->assertOk();
});

test('products can be created with an expiration date', function () {
    $user = User::factory()->create();
    $team = Team::factory()->personal()->create();
    $team->members()->attach($user, [
        'role' => TeamRole::Owner->value,
    ]);

    $category = Category::factory()->create(['team_id' => $team->id]);

    $response = $this
        ->actingAs($user)
        ->post(route('products.store', ['current_team' => $team]), [
            'name' => 'Yogurt Natural',
            'sku' => 'YOG-001',
            'sale_price' => 150.00,
            'cost_price' => 100.00,
            'stock' => 20,
            'minimum_stock' => 5,
            'expiration_date' => now()->addDays(5)->toDateString(),
            'category_id' => $category->id,
        ]);

    $response->assertRedirect(route('products.index', ['current_team' => $team]));

    $this->assertDatabaseHas('products', [
        'team_id' => $team->id,
        'name' => 'Yogurt Natural',
        'sku' => 'YOG-001',
        'expiration_date' => now()->addDays(5)->toDateString(),
    ]);
});

test('products can be updated', function () {
    $user = User::factory()->create();
    $team = Team::factory()->personal()->create();
    $team->members()->attach($user, [
        'role' => TeamRole::Owner->value,
    ]);

    $category = Category::factory()->create(['team_id' => $team->id]);

    $product = Product::factory()->create([
        'team_id' => $team->id,
        'category_id' => $category->id,
        'name' => 'Original Product',
        'sku' => 'SKU-001',
        'sale_price' => 100.00,
        'stock' => 10,
        'minimum_stock' => 5,
        'is_active' => true,
        'expiration_date' => now()->addDays(10)->toDateString(),
    ]);

    $newExpiration = now()->addDays(3)->toDateString();

    $response = $this
        ->actingAs($user)
        ->patch(route('products.update', ['current_team' => $team, 'product' => $product]), [
            'name' => 'Updated Product',
            'sku' => 'SKU-001-MOD',
            'sale_price' => 120.00,
            'stock' => 25,
            'minimum_stock' => 10,
            'category_id' => $category->id,
            'expiration_date' => $newExpiration,
        ]);

    $response->assertRedirect(route('products.index', ['current_team' => $team]));

    $product->refresh();

    expect($product->name)->toBe('Updated Product')
        ->and($product->sku)->toBe('SKU-001-MOD')
        ->and((float) $product->sale_price)->toBe(120.00)
        ->and($product->stock)->toBe(25)
        ->and($product->minimum_stock)->toBe(10)
        ->and($product->expiration_date?->toDateString())->toBe($newExpiration);
});

test('products can be filtered by expiring soon or expired', function () {
    $user = User::factory()->create();
    $team = Team::factory()->personal()->create();
    $team->members()->attach($user, [
        'role' => TeamRole::Owner->value,
    ]);

    $expiringProduct = Product::factory()->create([
        'team_id' => $team->id,
        'name' => 'Leche Fresca',
        'stock' => 10,
        'is_active' => true,
        'expiration_date' => now()->addDays(2)->toDateString(),
    ]);

    $expiredProduct = Product::factory()->create([
        'team_id' => $team->id,
        'name' => 'Queso Vencido',
        'stock' => 5,
        'is_active' => true,
        'expiration_date' => now()->subDays(2)->toDateString(),
    ]);

    $normalProduct = Product::factory()->create([
        'team_id' => $team->id,
        'name' => 'Arroz Largo',
        'stock' => 50,
        'is_active' => true,
        'expiration_date' => now()->addDays(60)->toDateString(),
    ]);

    // Test expiring soon filter
    $response = $this
        ->actingAs($user)
        ->get(route('products.index', ['current_team' => $team, 'filter' => 'expiring_soon']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('products/index')
        ->where('filter', 'expiring_soon')
        ->has('products.data', 1)
        ->where('products.data.0.id', $expiringProduct->id)
    );

    // Test expired filter
    $response = $this
        ->actingAs($user)
        ->get(route('products.index', ['current_team' => $team, 'filter' => 'expired']));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('products/index')
        ->where('filter', 'expired')
        ->has('products.data', 1)
        ->where('products.data.0.id', $expiredProduct->id)
    );
});

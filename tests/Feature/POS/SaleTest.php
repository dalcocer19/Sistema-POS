<?php

use App\Models\Product;
use App\Models\Sale;
use App\Models\Team;
use App\Models\User;

test('a sale decrements stock and keeps the historical price', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $product = Product::create([
        'team_id' => $team->id,
        'name' => 'Arroz',
        'sku' => 'ARR-001',
        'sale_price' => '2.50',
        'stock' => '5',
        'minimum_stock' => '1',
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->post(route('sales.store', $team), [
        'payment_method' => 'cash',
        'amount_received' => '10.00',
        'items' => [['product_id' => $product->id, 'quantity' => 2]],
    ]);

    $sale = Sale::query()->firstOrFail();

    $response->assertRedirect(route('sales.show', [$team, $sale]));
    expect($product->fresh()->stock)->toBe(3);
    $this->assertDatabaseHas('sale_items', [
        'sale_id' => $sale->id,
        'product_name' => 'Arroz',
        'unit_price' => '2.50',
        'line_total' => '5.00',
    ]);
    $this->assertDatabaseHas('inventory_movements', [
        'sale_id' => $sale->id,
        'quantity' => '-2.000',
        'type' => 'sale',
    ]);
});

test('a sale is rejected when stock is insufficient', function () {
    $user = User::factory()->create();
    $team = $user->currentTeam;
    $product = Product::create([
        'team_id' => $team->id,
        'name' => 'Leche',
        'sku' => 'LEC-001',
        'sale_price' => '1.25',
        'stock' => '1',
        'minimum_stock' => '1',
        'is_active' => true,
    ]);

    $response = $this->actingAs($user)->post(route('sales.store', $team), [
        'payment_method' => 'card',
        'items' => [['product_id' => $product->id, 'quantity' => 2]],
    ]);

    $response->assertSessionHasErrors('items');
    expect($product->fresh()->stock)->toBe(1);
    $this->assertDatabaseCount('sales', 0);
});

test('a team cannot sell another teams product', function () {
    $seller = User::factory()->create();
    $otherTeam = Team::factory()->create();
    $product = Product::create([
        'team_id' => $otherTeam->id,
        'name' => 'Pan',
        'sku' => 'PAN-001',
        'sale_price' => '3.00',
        'stock' => '4',
        'minimum_stock' => '1',
        'is_active' => true,
    ]);

    $response = $this->actingAs($seller)->post(route('sales.store', $seller->currentTeam), [
        'payment_method' => 'other',
        'items' => [['product_id' => $product->id, 'quantity' => 1]],
    ]);

    $response->assertSessionHasErrors('items');
    expect($product->fresh()->stock)->toBe(4);
    $this->assertDatabaseCount('sales', 0);
});

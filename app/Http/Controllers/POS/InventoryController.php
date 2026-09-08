<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Http\Requests\POS\AdjustInventoryRequest;
use App\Models\InventoryMovement;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    public function index(Team $currentTeam): Response
    {
        Gate::authorize('viewAny', [InventoryMovement::class, $currentTeam]);

        return Inertia::render('inventory/index', [
            'products' => $currentTeam->products()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'sku', 'stock', 'minimum_stock']),
            'movements' => $currentTeam->products()->with(['inventoryMovements' => fn ($query) => $query->latest()->limit(10)])->get(['id', 'name']),
        ]);
    }

    public function store(AdjustInventoryRequest $request, Team $currentTeam): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $currentTeam, $request): void {
            $product = $currentTeam->products()
                ->whereKey($data['product_id'])
                ->lockForUpdate()
                ->firstOrFail();
            $product->increment('stock', (float) $data['quantity']);

            InventoryMovement::create([
                'team_id' => $currentTeam->id,
                'product_id' => $product->id,
                'user_id' => $request->user()->id,
                'type' => $data['type'],
                'quantity' => $data['quantity'],
                'reason' => $data['reason'] ?? null,
            ]);
        });

        return to_route('inventory.index', ['current_team' => $currentTeam]);
    }
}

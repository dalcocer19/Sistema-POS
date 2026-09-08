<?php

namespace App\Http\Controllers\POS;

use App\Actions\POS\CreateSale;
use App\Http\Controllers\Controller;
use App\Http\Requests\POS\StoreSaleRequest;
use App\Models\Sale;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(Team $currentTeam): Response
    {
        Gate::authorize('viewAny', [Sale::class, $currentTeam]);

        return Inertia::render('sales/index', [
            'sales' => $currentTeam->sales()->with('user:id,name')->latest('sold_at')->paginate(20),
        ]);
    }

    public function create(Team $currentTeam): Response
    {
        Gate::authorize('create', [Sale::class, $currentTeam]);

        return Inertia::render('pos/index', [
            'products' => $currentTeam->products()->where('is_active', true)->where('stock', '>', 0)->orderBy('name')->get(['id', 'name', 'sku', 'barcode', 'sale_price', 'stock']),
        ]);
    }

    public function store(StoreSaleRequest $request, Team $currentTeam, CreateSale $createSale): RedirectResponse
    {
        $sale = $createSale->handle($currentTeam, $request->user(), $request->saleData());

        return to_route('sales.show', ['current_team' => $currentTeam, 'sale' => $sale]);
    }

    public function show(Team $currentTeam, Sale $sale): Response
    {
        abort_unless($sale->team_id === $currentTeam->id, 404);
        Gate::authorize('view', $sale);

        return Inertia::render('sales/show', ['sale' => $sale->load(['items', 'user:id,name'])]);
    }
}

<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Http\Requests\POS\SaveProductRequest;
use App\Models\Product;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(Request $request, Team $currentTeam): Response
    {
        Gate::authorize('viewAny', [Product::class, $currentTeam]);

        $search = $request->string('search')->trim()->value();
        $filter = $request->string('filter')->trim()->value();
        $products = $currentTeam->products()
            ->where('is_active', true)
            ->with('category:id,name')
            ->when($search, fn ($query) => $query->where(fn ($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%")
                ->orWhere('barcode', 'like', "%{$search}%")))
            ->when($filter === 'expiring_soon', fn ($query) => $query->expiringSoon(7))
            ->when($filter === 'expired', fn ($query) => $query->expired())
            ->orderBy('name')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('products/index', [
            'products' => $products,
            'categories' => $currentTeam->categories()->orderBy('name')->get(['id', 'name']),
            'filter' => $filter ?: 'all',
        ]);
    }

    public function store(SaveProductRequest $request, Team $currentTeam): RedirectResponse
    {
        $currentTeam->products()->create($request->validated() + ['is_active' => $request->boolean('is_active', true)]);

        return to_route('products.index', ['current_team' => $currentTeam]);
    }

    public function update(SaveProductRequest $request, Team $currentTeam, Product $product): RedirectResponse
    {
        Gate::authorize('update', $product);
        abort_unless($product->team_id === $currentTeam->id, 404);
        $product->update($request->validated());

        return to_route('products.index', ['current_team' => $currentTeam]);
    }

    public function destroy(Team $currentTeam, Product $product): RedirectResponse
    {
        Gate::authorize('delete', $product);
        abort_unless($product->team_id === $currentTeam->id, 404);
        $product->update(['is_active' => false]);

        return to_route('products.index', ['current_team' => $currentTeam]);
    }
}

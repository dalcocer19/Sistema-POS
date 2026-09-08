<?php

namespace App\Http\Controllers;

use App\Models\TeamInvitation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $email = strtolower($request->user()->email);
        $currentTeam = $request->user()->currentTeam;
        $today = now()->startOfDay();

        $pendingInvitations = TeamInvitation::query()
            ->with(['inviter', 'team'])
            ->whereRaw('LOWER(email) = ?', [$email])
            ->whereNull('accepted_at')
            ->where(fn ($query) => $query
                ->whereNull('expires_at')
                ->orWhere('expires_at', '>=', now()))
            ->latest()
            ->get()
            ->map(fn (TeamInvitation $invitation) => [
                'code' => $invitation->code,
                'inviterName' => $invitation->inviter->name,
                'team' => [
                    'name' => $invitation->team->name,
                    'slug' => $invitation->team->slug,
                ],
            ]);

        $expiringSoonCount = $currentTeam?->products()
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->expiringSoon(7)
            ->count() ?? 0;

        $expiredCount = $currentTeam?->products()
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->expired()
            ->count() ?? 0;

        $expiringProducts = $currentTeam?->products()
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->whereNotNull('expiration_date')
            ->where('expiration_date', '<=', today()->addDays(7))
            ->orderBy('expiration_date', 'asc')
            ->limit(5)
            ->get(['id', 'name', 'sku', 'stock', 'expiration_date'])
            ->map(fn ($product) => [
                'id' => $product->id,
                'name' => $product->name,
                'sku' => $product->sku,
                'stock' => $product->stock,
                'expiration_date' => $product->expiration_date?->toDateString(),
                'is_expired' => $product->expiration_date?->isPast() && ! $product->expiration_date?->isToday(),
                'days_remaining' => (int) today()->diffInDays($product->expiration_date, false),
            ]) ?? [];

        return Inertia::render('dashboard', [
            'pendingInvitations' => $pendingInvitations,
            'metrics' => [
                'salesToday' => $currentTeam?->sales()->where('sold_at', '>=', $today)->count() ?? 0,
                'revenueToday' => $currentTeam?->sales()->where('sold_at', '>=', $today)->sum('total') ?? 0,
                'activeProducts' => $currentTeam?->products()->where('is_active', true)->count() ?? 0,
                'lowStockProducts' => $currentTeam?->products()->where('is_active', true)->whereColumn('stock', '<=', 'minimum_stock')->count() ?? 0,
                'expiringSoonProducts' => $expiringSoonCount,
                'expiredProducts' => $expiredCount,
            ],
            'expiringProducts' => $expiringProducts,
            'recentSales' => $currentTeam?->sales()->with('user:id,name')->latest('sold_at')->limit(5)->get() ?? [],
        ]);
    }
}

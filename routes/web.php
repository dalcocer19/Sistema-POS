<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\POS\CategoryController;
use App\Http\Controllers\POS\InventoryController;
use App\Http\Controllers\POS\ProductController;
use App\Http\Controllers\POS\SaleController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboard');
        Route::get('products', [ProductController::class, 'index'])->name('products.index');
        Route::post('products', [ProductController::class, 'store'])->name('products.store');
        Route::patch('products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
        Route::get('categories', [CategoryController::class, 'index'])->name('categories.index');
        Route::post('categories', [CategoryController::class, 'store'])->name('categories.store');
        Route::patch('categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
        Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
        Route::post('inventory/movements', [InventoryController::class, 'store'])->name('inventory.store');
        Route::get('pos', [SaleController::class, 'create'])->name('pos.create');
        Route::get('sales', [SaleController::class, 'index'])->name('sales.index');
        Route::post('sales', [SaleController::class, 'store'])->name('sales.store');
        Route::get('sales/{sale}', [SaleController::class, 'show'])->name('sales.show');
    });

Route::middleware(['auth'])->group(function () {
    Route::post('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';

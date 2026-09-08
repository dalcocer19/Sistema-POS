<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $team_id
 * @property int|null $category_id
 * @property string $name
 * @property string $sku
 * @property string|null $barcode
 * @property string $sale_price
 * @property string|null $cost_price
 * @property int $stock
 * @property int|null $minimum_stock
 * @property bool $is_active
 * @property Carbon|null $expiration_date
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['team_id', 'category_id', 'name', 'sku', 'barcode', 'sale_price', 'cost_price', 'stock', 'minimum_stock', 'is_active', 'expiration_date'])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    /** @return BelongsTo<Team, $this> */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return HasMany<InventoryMovement, $this> */
    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }

    /** @return HasMany<SaleItem, $this> */
    public function saleItems(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    /**
     * Scope a query to only include products expiring soon within the given number of days.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeExpiringSoon(Builder $query, int $days = 7): Builder
    {
        return $query->whereNotNull('expiration_date')
            ->where('expiration_date', '>=', today())
            ->where('expiration_date', '<=', today()->addDays($days));
    }

    /**
     * Scope a query to only include expired products.
     *
     * @param  Builder<$this>  $query
     * @return Builder<$this>
     */
    public function scopeExpired(Builder $query): Builder
    {
        return $query->whereNotNull('expiration_date')
            ->where('expiration_date', '<', today());
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'sale_price' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'stock' => 'integer',
            'minimum_stock' => 'integer',
            'is_active' => 'boolean',
            'expiration_date' => 'date',
        ];
    }
}


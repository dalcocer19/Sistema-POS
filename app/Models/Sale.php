<?php

namespace App\Models;

use Database\Factories\SaleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['team_id', 'user_id', 'number', 'subtotal', 'total', 'payment_method', 'amount_received', 'change_due', 'sold_at'])]
class Sale extends Model
{
    /** @use HasFactory<SaleFactory> */
    use HasFactory;

    /** @return BelongsTo<Team, $this> */
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<SaleItem, $this> */
    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    /** @return HasMany<InventoryMovement, $this> */
    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'total' => 'decimal:2',
            'amount_received' => 'decimal:2',
            'change_due' => 'decimal:2',
            'sold_at' => 'datetime',
        ];
    }
}

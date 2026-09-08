<?php

namespace App\Policies;

use App\Enums\TeamPermission;
use App\Models\Product;
use App\Models\Team;
use App\Models\User;

class ProductPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user, Team $team): bool
    {
        return $user->belongsToTeam($team);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Product $product): bool
    {
        return $user->belongsToTeam($product->team);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Team $team): bool
    {
        return $user->hasTeamPermission($team, TeamPermission::ManageProducts);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Product $product): bool
    {
        return $user->hasTeamPermission($product->team, TeamPermission::ManageProducts);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Product $product): bool
    {
        return $user->hasTeamPermission($product->team, TeamPermission::ManageProducts);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Product $product): bool
    {
        return $this->update($user, $product);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Product $product): bool
    {
        return $this->delete($user, $product);
    }
}

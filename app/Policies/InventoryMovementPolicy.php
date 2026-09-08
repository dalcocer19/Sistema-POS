<?php

namespace App\Policies;

use App\Enums\TeamPermission;
use App\Models\InventoryMovement;
use App\Models\Team;
use App\Models\User;

class InventoryMovementPolicy
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
    public function view(User $user, InventoryMovement $inventoryMovement): bool
    {
        return $user->belongsToTeam($inventoryMovement->team);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Team $team): bool
    {
        return $user->hasTeamPermission($team, TeamPermission::ManageInventory);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, InventoryMovement $inventoryMovement): bool
    {
        return $user->hasTeamPermission($inventoryMovement->team, TeamPermission::ManageInventory);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, InventoryMovement $inventoryMovement): bool
    {
        return false;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, InventoryMovement $inventoryMovement): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, InventoryMovement $inventoryMovement): bool
    {
        return false;
    }
}

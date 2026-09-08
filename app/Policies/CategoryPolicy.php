<?php

namespace App\Policies;

use App\Enums\TeamPermission;
use App\Models\Category;
use App\Models\Team;
use App\Models\User;

class CategoryPolicy
{
    public function viewAny(User $user, Team $team): bool
    {
        return $user->belongsToTeam($team);
    }

    public function view(User $user, Category $category): bool
    {
        return $user->belongsToTeam($category->team);
    }

    public function create(User $user, Team $team): bool
    {
        return $user->hasTeamPermission($team, TeamPermission::ManageProducts);
    }

    public function update(User $user, Category $category): bool
    {
        return $user->hasTeamPermission($category->team, TeamPermission::ManageProducts);
    }

    public function delete(User $user, Category $category): bool
    {
        return $user->hasTeamPermission($category->team, TeamPermission::ManageProducts);
    }
}

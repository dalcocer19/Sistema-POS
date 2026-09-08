<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Http\Requests\POS\SaveCategoryRequest;
use App\Models\Category;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Team $currentTeam): Response
    {
        Gate::authorize('viewAny', [Category::class, $currentTeam]);

        return Inertia::render('categories/index', [
            'categories' => $currentTeam->categories()->withCount('products')->orderBy('name')->get(),
        ]);
    }

    public function store(SaveCategoryRequest $request, Team $currentTeam): RedirectResponse
    {
        $name = $request->validated('name');
        $currentTeam->categories()->create([
            'name' => $name,
            'slug' => $request->validated('slug') ?: str($name)->slug()->value(),
        ]);

        return to_route('categories.index', ['current_team' => $currentTeam]);
    }

    public function update(SaveCategoryRequest $request, Team $currentTeam, Category $category): RedirectResponse
    {
        Gate::authorize('update', $category);
        abort_unless($category->team_id === $currentTeam->id, 404);
        $data = $request->validated();
        $category->update([
            'name' => $data['name'],
            'slug' => $data['slug'] ?: str($data['name'])->slug()->value(),
        ]);

        return to_route('categories.index', ['current_team' => $currentTeam]);
    }

    public function destroy(Team $currentTeam, Category $category): RedirectResponse
    {
        Gate::authorize('delete', $category);
        abort_unless($category->team_id === $currentTeam->id, 404);
        $category->delete();

        return to_route('categories.index', ['current_team' => $currentTeam]);
    }
}

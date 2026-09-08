<?php

namespace App\Http\Requests\POS;

use App\Enums\TeamPermission;
use App\Models\Category;
use App\Models\Team;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $team = $this->route('current_team');

        return $team instanceof Team
            && $this->user()?->hasTeamPermission($team, TeamPermission::ManageProducts) === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $team = $this->route('current_team');
        $teamId = $team instanceof Team ? $team->id : null;
        $category = $this->route('category');
        $categoryId = $category instanceof Category ? $category->id : null;

        return [
            'name' => ['required', 'string', 'max:120'],
            'slug' => [
                'nullable',
                'string',
                'max:120',
                Rule::unique('categories', 'slug')
                    ->where(fn ($query) => $query->where('team_id', $teamId))
                    ->ignore($categoryId),
            ],
        ];
    }
}

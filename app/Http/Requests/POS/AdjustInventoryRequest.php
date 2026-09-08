<?php

namespace App\Http\Requests\POS;

use App\Enums\TeamPermission;
use App\Models\Team;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdjustInventoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $team = $this->route('current_team');

        return $team instanceof Team
            && $this->user()?->hasTeamPermission($team, TeamPermission::ManageInventory) === true;
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

        return [
            'product_id' => ['required', 'integer', Rule::exists('products', 'id')->where(fn ($query) => $query->where('team_id', $teamId))],
            'type' => ['required', Rule::in(['entry', 'adjustment'])],
            'quantity' => ['required', 'numeric', 'decimal:0,3', 'gt:0'],
            'reason' => ['nullable', 'string', 'max:240'],
        ];
    }
}

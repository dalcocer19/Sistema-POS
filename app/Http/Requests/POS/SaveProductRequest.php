<?php

namespace App\Http\Requests\POS;

use App\Enums\TeamPermission;
use App\Models\Product;
use App\Models\Team;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveProductRequest extends FormRequest
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
        $product = $this->route('product');
        $productId = $product instanceof Product ? $product->id : null;

        return [
            'category_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->where(fn ($query) => $query->where('team_id', $teamId))],
            'name' => ['required', 'string', 'max:160'],
            'sku' => ['required', 'string', 'max:80', Rule::unique('products', 'sku')->where(fn ($query) => $query->where('team_id', $teamId))->ignore($productId)],
            'barcode' => ['nullable', 'string', 'max:80', Rule::unique('products', 'barcode')->where(fn ($query) => $query->where('team_id', $teamId))->ignore($productId)],
            'sale_price' => ['required', 'numeric', 'decimal:0,2', 'min:0'],
            'cost_price' => ['nullable', 'numeric', 'decimal:0,2', 'min:0'],
            'stock' => ['required', 'integer', 'min:0'],
            'minimum_stock' => ['nullable', 'integer', 'min:0'],
            'expiration_date' => ['nullable', 'date'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}

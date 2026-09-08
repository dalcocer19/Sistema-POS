<?php

namespace App\Http\Requests\POS;

use App\Enums\TeamPermission;
use App\Models\Team;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSaleRequest extends FormRequest
{
    /**
     * @return array{payment_method: string, amount_received: string|int|float|null, items: array<int, array{product_id: int, quantity: string|int|float}>}
     */
    public function saleData(): array
    {
        $validated = $this->validated();

        return [
            'payment_method' => (string) $validated['payment_method'],
            'amount_received' => $validated['amount_received'] ?? null,
            'items' => array_map(
                fn (array $item): array => [
                    'product_id' => (int) $item['product_id'],
                    'quantity' => $item['quantity'],
                ],
                $validated['items'],
            ),
        ];
    }

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $team = $this->route('current_team');

        return $team instanceof Team
            && $this->user()?->hasTeamPermission($team, TeamPermission::Sell) === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'payment_method' => ['required', Rule::in(['cash', 'card', 'other'])],
            'amount_received' => ['nullable', 'numeric', 'decimal:0,2', 'min:0'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'distinct'],
            'items.*.quantity' => ['required', 'numeric', 'decimal:0,3', 'gt:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->input('payment_method') === 'cash' && ! $this->filled('amount_received')) {
            $this->merge(['amount_received' => null]);
        }
    }
}

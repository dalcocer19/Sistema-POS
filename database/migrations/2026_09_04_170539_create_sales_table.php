<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('number');
            $table->decimal('subtotal', 12, 2);
            $table->decimal('total', 12, 2);
            $table->string('payment_method');
            $table->decimal('amount_received', 12, 2)->nullable();
            $table->decimal('change_due', 12, 2)->default(0);
            $table->timestamp('sold_at');
            $table->timestamps();

            $table->unique(['team_id', 'number']);
            $table->index(['team_id', 'sold_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};

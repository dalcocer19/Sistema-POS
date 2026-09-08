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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('sku');
            $table->string('barcode')->nullable();
            $table->decimal('sale_price', 12, 2);
            $table->decimal('cost_price', 12, 2)->nullable();
            $table->decimal('stock', 12, 3)->default(0);
            $table->decimal('minimum_stock', 12, 3)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['team_id', 'sku']);
            $table->unique(['team_id', 'barcode']);
            $table->index(['team_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};

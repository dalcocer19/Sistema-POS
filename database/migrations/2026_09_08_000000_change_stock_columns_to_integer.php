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
        Schema::table('products', function (Blueprint $table) {
            $table->integer('stock')->change();
            //$table->integer('minimum_stock')->change();
            $table->integer('minimum_stock')->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('stock', 8, 3)->change();
            $table->decimal('minimum_stock', 8, 3)->change();
        });
    }
};

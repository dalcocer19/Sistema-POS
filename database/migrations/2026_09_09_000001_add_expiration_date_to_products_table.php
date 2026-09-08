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
            $table->date('expiration_date')->nullable()->after('minimum_stock');
            $table->index(['team_id', 'is_active', 'expiration_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['team_id', 'is_active', 'expiration_date']);
            $table->dropColumn('expiration_date');
        });
    }
};

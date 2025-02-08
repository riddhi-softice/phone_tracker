<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_purchases', function (Blueprint $table) {
            $table->id();
            $table->string('purchase_json');
            $table->enum('payment_status', ['Success', 'Failed']);
            $table->string('reason')->nullable();

            // $table->unsignedBigInteger('user_id');  // Foreign key to reference the user
            // $table->string('package_id');           // In-app package ID
            // $table->decimal('price', 8, 2);         // Price of the package
            // $table->string('transaction_id')->nullable(); // Optional transaction ID
            // $table->dateTime('purchase_date')->nullable(); // Purchase date
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_purchases');
    }
};

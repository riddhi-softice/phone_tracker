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
        Schema::create('location_history', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_user_id');
            $table->unsignedBigInteger('user_id');
            $table->decimal('lattitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->decimal('accuracy ', 10, 7);
            $table->decimal('course ', 10, 7);
            $table->boolean('isMock')->default(false); 
            $table->string('address')->nullable();
            $table->enum('user_status', ['active', 'charging', 'low_bettery', 'disable']);
            $table->integer('phone_bettery')->nullable();
            $table->decimal('user_speed', 8, 2)->nullable();
            $table->dateTime('datetime');
            $table->timestamps();
            // $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('location_history');
    }
};

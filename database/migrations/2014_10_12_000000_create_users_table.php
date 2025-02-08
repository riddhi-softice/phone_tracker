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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('email')->nullable();
            $table->string('social_id')->nullable();
            $table->string('profile_pic')->nullable();
            // $table->decimal('lattitude', 10, 7)->nullable();
            // $table->decimal('longitude', 10, 7)->nullable();
            // $table->string('address')->nullable();
            $table->enum('location_status', ['on','off'])->default('on');
            $table->string('source_lan')->nullable();
            $table->string('join_code')->nullable();
            $table->string('device_name')->nullable();
            $table->string('player_id')->nullable();
            $table->rememberToken();
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
        Schema::dropIfExists('users');
    }
};

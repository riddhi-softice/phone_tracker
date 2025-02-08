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
        Schema::create('join_user', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('parent_user_id');
            $table->unsignedBigInteger('child_user_id');
            $table->string('device_name');
            $table->dateTime('join_date');
            $table->enum('join_type', ['code', 'bar_code', 'link']);
            $table->enum('user_status', ['active', 'charging', 'low_bettery', 'disable']);
            $table->integer('is_deleted');
            $table->timestamps();
            // $table->foreign('parent_user_id')->references('id')->on('users')->onDelete('cascade');
            // $table->foreign('child_user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('join_user');
    }
};

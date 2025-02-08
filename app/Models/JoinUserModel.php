<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JoinUserModel extends Model
{
    protected $table = 'join_user';
    protected $guarded = [];

    public function parentUser()
    {
        return $this->belongsTo(User::class, 'parent_user_id', 'id');
    }

}

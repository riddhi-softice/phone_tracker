<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GeoJson extends Model
{
    protected $guarded = [];
    protected $casts = [
        'geojson' => 'array', // Cast geojson field to array
    ];
}

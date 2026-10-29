<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tutor extends Model
{
    protected $fillable = [
        'first_name', 'last_name', 'photo_url', 'experience_years', 'bio',
        'rating', 'completed_lessons', 'is_active',
    ];

    protected function casts(): array
    {
        return ['rating' => 'float', 'is_active' => 'boolean'];
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class);
    }

    public function schoolLevels(): BelongsToMany
    {
        return $this->belongsToMany(SchoolLevel::class);
    }

    public function availabilities(): HasMany
    {
        return $this->hasMany(TutorAvailability::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}

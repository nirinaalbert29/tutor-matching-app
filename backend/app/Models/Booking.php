<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'reference', 'tutor_availability_id', 'subject_id', 'school_level_id',
        'parent_name', 'parent_email', 'student_name', 'notes',
    ];

    public function availability(): BelongsTo
    {
        return $this->belongsTo(TutorAvailability::class, 'tutor_availability_id');
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function schoolLevel(): BelongsTo
    {
        return $this->belongsTo(SchoolLevel::class);
    }
}

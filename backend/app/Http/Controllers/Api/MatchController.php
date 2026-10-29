<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolLevel;
use App\Models\Subject;
use App\Services\TutorMatchingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class MatchController extends Controller
{
    public function __invoke(Request $request, TutorMatchingService $matching): JsonResponse
    {
        $data = $request->validate([
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'school_level_id' => ['required', 'integer', 'exists:school_levels,id'],
            'availability' => ['required', 'array', 'min:1', 'max:30'],
            'availability.*.start_at' => ['required', 'date', 'after:now'],
            'availability.*.end_at' => ['required', 'date'],
        ]);

        foreach ($data['availability'] as $index => $window) {
            if (strtotime($window['end_at']) <= strtotime($window['start_at'])) {
                throw ValidationException::withMessages([
                    "availability.$index.end_at" => 'The end time must be after the start time.',
                ]);
            }
        }

        return response()->json([
            'criteria' => [
                'subject' => Subject::findOrFail($data['subject_id'], ['id', 'name']),
                'school_level' => SchoolLevel::findOrFail($data['school_level_id'], ['id', 'name']),
                'availability' => $data['availability'],
            ],
            'matching' => [
                'required_criteria' => ['subject', 'school_level', 'availability'],
                'ranking' => 'rating (50%), experience (30%), completed lessons (20%)',
            ],
            'tutors' => $matching->match(
                (int) $data['subject_id'],
                (int) $data['school_level_id'],
                $data['availability'],
            )->map(fn ($tutor) => [
                'id' => $tutor->id,
                'first_name' => $tutor->first_name,
                'last_name' => $tutor->last_name,
                'photo_url' => $tutor->photo_url,
                'experience_years' => $tutor->experience_years,
                'bio' => $tutor->bio,
                'rating' => $tutor->rating,
                'completed_lessons' => $tutor->completed_lessons,
                'matching_score' => $tutor->matching_score,
                'subjects' => $tutor->subjects->map(fn ($subject) => [
                    'id' => $subject->id, 'name' => $subject->name,
                ]),
                'school_levels' => $tutor->schoolLevels->map(fn ($level) => [
                    'id' => $level->id, 'name' => $level->name,
                ]),
                'available_slots' => $tutor->availabilities->map(fn ($slot) => [
                    'id' => $slot->id,
                    'starts_at' => $slot->starts_at->toIso8601String(),
                    'ends_at' => $slot->ends_at->toIso8601String(),
                ]),
            ]),
        ]);
    }
}

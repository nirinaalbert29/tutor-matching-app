<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tutor;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TutorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'subject_id' => ['sometimes', 'integer', 'exists:subjects,id'],
            'school_level_id' => ['sometimes', 'integer', 'exists:school_levels,id'],
        ]);

        $tutors = Tutor::query()->active()
            ->when(isset($filters['subject_id']), fn (Builder $query) => $query->whereHas(
                'subjects', fn (Builder $subjects) => $subjects->whereKey($filters['subject_id']),
            ))
            ->when(isset($filters['school_level_id']), fn (Builder $query) => $query->whereHas(
                'schoolLevels', fn (Builder $levels) => $levels->whereKey($filters['school_level_id']),
            ))
            ->with(['subjects:id,name,slug', 'schoolLevels:id,name,rank'])
            ->orderByDesc('rating')
            ->get();

        return response()->json(['data' => $tutors]);
    }
}

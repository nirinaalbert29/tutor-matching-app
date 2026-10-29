<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolLevel;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;

class CatalogController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'subjects' => Subject::query()->orderBy('name')->get(['id', 'name', 'slug']),
            'school_levels' => SchoolLevel::query()->orderBy('rank')->get(['id', 'name', 'rank']),
        ]);
    }
}

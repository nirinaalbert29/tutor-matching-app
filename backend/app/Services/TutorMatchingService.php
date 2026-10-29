<?php

namespace App\Services;

use App\Models\Tutor;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Collection;

class TutorMatchingService
{
    /**
     * Apply all required criteria in SQL before sorting by experience and reviews.
     * A requested window must contain the whole lesson slot.
     *
     * @param  array<int, array{start_at: string, end_at: string}>  $windows
     * @return Collection<int, Tutor>
     */
    public function match(int $subjectId, int $schoolLevelId, array $windows): Collection
    {
        $hasRequestedAvailability = static function (Builder|Relation $query) use ($windows): void {
            $query->where(function (Builder $availability) use ($windows): void {
                foreach ($windows as $window) {
                    $availability->orWhere(function (Builder $slot) use ($window): void {
                        $slot->where('starts_at', '>=', $window['start_at'])
                            ->where('ends_at', '<=', $window['end_at']);
                    });
                }
            });
        };

        return Tutor::query()
            ->active()
            ->whereHas('subjects', fn (Builder $query) => $query->whereKey($subjectId))
            ->whereHas('schoolLevels', fn (Builder $query) => $query->whereKey($schoolLevelId))
            ->whereHas('availabilities', function (Builder $query) use ($hasRequestedAvailability): void {
                $query->where('starts_at', '>', now())
                    ->whereDoesntHave('booking')
                    ->where($hasRequestedAvailability);
            })
            ->with([
                'subjects:id,name,slug',
                'schoolLevels:id,name,rank',
                'availabilities' => function (Builder|Relation $query) use ($hasRequestedAvailability): void {
                    $query->where('starts_at', '>', now())
                        ->whereDoesntHave('booking')
                        ->where($hasRequestedAvailability)
                        ->orderBy('starts_at');
                },
            ])
            ->get()
            ->map(function (Tutor $tutor): Tutor {
                // Optional ranking: rating (0–50), experience (0–30), completed lessons (0–20).
                $tutor->setAttribute('matching_score', round(
                    ($tutor->rating / 5 * 50)
                    + (min($tutor->experience_years, 10) / 10 * 30)
                    + (min($tutor->completed_lessons, 100) / 100 * 20),
                    1,
                ));

                return $tutor;
            })
            ->sortByDesc('matching_score')
            ->values();
    }
}

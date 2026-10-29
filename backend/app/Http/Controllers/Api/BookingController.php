<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Tutor;
use App\Models\TutorAvailability;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class BookingController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'tutor_id' => ['required', 'integer', 'exists:tutors,id'],
            'availability_id' => ['required', 'integer', 'exists:tutor_availabilities,id'],
            'subject_id' => ['required', 'integer', 'exists:subjects,id'],
            'school_level_id' => ['required', 'integer', 'exists:school_levels,id'],
            'parent_name' => ['required', 'string', 'max:120'],
            'parent_email' => ['required', 'email', 'max:255'],
            'student_name' => ['required', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            $booking = DB::transaction(function () use ($data): Booking {
                $slot = TutorAvailability::query()
                    ->where('tutor_id', $data['tutor_id'])
                    ->whereKey($data['availability_id'])
                    ->lockForUpdate()
                    ->first();

                if (! $slot || $slot->starts_at->isPast()) {
                    throw ValidationException::withMessages([
                        'availability_id' => 'This lesson slot is no longer available.',
                    ]);
                }

                $tutor = Tutor::query()->active()
                    ->whereKey($data['tutor_id'])
                    ->whereHas('subjects', fn ($query) => $query->whereKey($data['subject_id']))
                    ->whereHas('schoolLevels', fn ($query) => $query->whereKey($data['school_level_id']))
                    ->exists();

                if (! $tutor) {
                    throw ValidationException::withMessages([
                        'tutor_id' => 'This tutor does not teach the selected subject and school level.',
                    ]);
                }

                if ($slot->booking()->exists()) {
                    throw new ConflictHttpException('This lesson slot has already been booked. Please choose another one.');
                }

                return Booking::create([
                    'reference' => (string) Str::uuid(),
                    'tutor_availability_id' => $slot->id,
                    'subject_id' => $data['subject_id'],
                    'school_level_id' => $data['school_level_id'],
                    'parent_name' => $data['parent_name'],
                    'parent_email' => $data['parent_email'],
                    'student_name' => $data['student_name'],
                    'notes' => $data['notes'] ?? null,
                ]);
            });
        } catch (QueryException $exception) {
            // The unique availability constraint is the final guard against concurrent bookings.
            $message = strtolower($exception->getMessage());
            $isAvailabilityConflict = str_contains($message, 'tutor_availability_id')
                && (str_contains($message, 'unique') || str_contains($message, 'duplicate'));

            if (! $isAvailabilityConflict) {
                throw $exception;
            }

            throw new ConflictHttpException('This lesson slot has already been booked. Please choose another one.', $exception);
        }

        return response()->json(['data' => $this->confirmation($booking)], 201);
    }

    public function show(string $reference): JsonResponse
    {
        $booking = Booking::query()
            ->where('reference', $reference)
            ->with(['availability.tutor', 'subject', 'schoolLevel'])
            ->firstOrFail();

        return response()->json(['data' => $this->confirmation($booking)]);
    }

    private function confirmation(Booking $booking): array
    {
        $booking->loadMissing(['availability.tutor', 'subject', 'schoolLevel']);

        return [
            'reference' => $booking->reference,
            'status' => 'confirmed',
            'student_name' => $booking->student_name,
            'tutor' => [
                'id' => $booking->availability->tutor->id,
                'first_name' => $booking->availability->tutor->first_name,
                'last_name' => $booking->availability->tutor->last_name,
                'photo_url' => $booking->availability->tutor->photo_url,
            ],
            'subject' => ['id' => $booking->subject->id, 'name' => $booking->subject->name],
            'school_level' => ['id' => $booking->schoolLevel->id, 'name' => $booking->schoolLevel->name],
            'starts_at' => $booking->availability->starts_at->toIso8601String(),
            'ends_at' => $booking->availability->ends_at->toIso8601String(),
        ];
    }
}

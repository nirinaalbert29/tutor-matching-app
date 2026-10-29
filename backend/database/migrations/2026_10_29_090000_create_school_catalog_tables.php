<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::create('school_levels', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->unsignedSmallInteger('rank')->unique();
            $table->timestamps();
        });

        Schema::create('tutors', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('photo_url')->nullable();
            $table->unsignedTinyInteger('experience_years')->default(0);
            $table->text('bio');
            $table->decimal('rating', 2, 1)->default(0);
            $table->unsignedInteger('completed_lessons')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });

        Schema::create('school_level_tutor', function (Blueprint $table) {
            $table->foreignId('school_level_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tutor_id')->constrained()->cascadeOnDelete();
            $table->primary(['school_level_id', 'tutor_id']);
        });

        Schema::create('subject_tutor', function (Blueprint $table) {
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tutor_id')->constrained()->cascadeOnDelete();
            $table->primary(['subject_id', 'tutor_id']);
        });

        Schema::create('tutor_availabilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_id')->constrained()->cascadeOnDelete();
            $table->timestampTz('starts_at');
            $table->timestampTz('ends_at');
            $table->timestamps();
            $table->unique(['tutor_id', 'starts_at', 'ends_at']);
            $table->index(['starts_at', 'ends_at']);
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->uuid('reference')->unique();
            $table->foreignId('tutor_availability_id')->unique()->constrained()->restrictOnDelete();
            $table->foreignId('subject_id')->constrained()->restrictOnDelete();
            $table->foreignId('school_level_id')->constrained()->restrictOnDelete();
            $table->string('parent_name');
            $table->string('parent_email');
            $table->string('student_name');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('tutor_availabilities');
        Schema::dropIfExists('subject_tutor');
        Schema::dropIfExists('school_level_tutor');
        Schema::dropIfExists('tutors');
        Schema::dropIfExists('school_levels');
        Schema::dropIfExists('subjects');
    }
};

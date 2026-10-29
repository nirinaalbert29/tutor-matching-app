<?php

namespace Database\Seeders;

use App\Models\SchoolLevel;
use App\Models\Subject;
use App\Models\Tutor;
use App\Models\TutorAvailability;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SchoolCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $subjects = collect([
            'Mathématiques', 'Français', 'Anglais', 'Physique-chimie',
            'Sciences de la vie et de la Terre', 'Histoire-géographie', 'Informatique', 'Espagnol',
        ])->mapWithKeys(function (string $name): array {
            $slug = Str::slug($name);
            $subject = Subject::updateOrCreate(['slug' => $slug], ['name' => $name]);

            return [$slug => $subject];
        });

        $levelNames = [
            '6e', '5e', '4e', '3e', 'Seconde', 'Première', 'Terminale',
        ];
        $levels = collect($levelNames)->values()->mapWithKeys(function (string $name, int $index): array {
            $level = SchoolLevel::updateOrCreate(['rank' => $index + 1], ['name' => $name]);

            return [$index + 1 => $level];
        });

        $tutors = [
            ['Léa', 'Martin', 8, 4.9, 186, 'Professeure de mathématiques, elle rend les notions complexes concrètes et accessibles.', ['mathematiques', 'informatique'], [1, 2, 3, 4, 5]],
            ['Thomas', 'Bernard', 6, 4.8, 142, 'Enseignant de français et d’histoire, attentif aux méthodes et à la confiance en soi.', ['francais', 'histoire-geographie'], [2, 3, 4, 5, 6, 7]],
            ['Inès', 'Petit', 5, 5.0, 97, 'Bilingue, elle accompagne les élèves en anglais avec des cours vivants et progressifs.', ['anglais', 'espagnol'], [1, 2, 3, 4, 5, 6]],
            ['Hugo', 'Robert', 11, 4.9, 264, 'Professeur de physique-chimie, spécialisé dans la préparation au brevet et au bac.', ['physique-chimie', 'mathematiques'], [3, 4, 5, 6, 7]],
            ['Sarah', 'Richard', 7, 4.7, 153, 'Passionnée par les sciences, elle aide chacun à progresser à son rythme.', ['sciences-de-la-vie-et-de-la-terre', 'physique-chimie'], [1, 2, 3, 4, 5, 6]],
            ['Yanis', 'Durand', 9, 4.9, 211, 'Il transforme les révisions d’histoire-géographie en récits et repères mémorables.', ['histoire-geographie', 'francais'], [2, 3, 4, 5, 6, 7]],
            ['Camille', 'Leroy', 4, 4.8, 88, 'Développeuse et tutrice, elle initie les élèves à la logique et à la programmation.', ['informatique', 'mathematiques'], [3, 4, 5, 6, 7]],
            ['Adam', 'Moreau', 12, 4.9, 302, 'Enseignant d’anglais depuis douze ans, il prépare aussi aux examens de langue.', ['anglais', 'francais'], [4, 5, 6, 7]],
            ['Chloé', 'Simon', 6, 4.6, 119, 'Elle accompagne les élèves en espagnol et encourage une expression orale naturelle.', ['espagnol', 'anglais'], [1, 2, 3, 4, 5, 6]],
            ['Mehdi', 'Laurent', 10, 4.8, 237, 'Professeur de mathématiques, il structure les révisions et consolide les bases.', ['mathematiques', 'physique-chimie'], [2, 3, 4, 5, 6, 7]],
            ['Emma', 'Lefebvre', 3, 4.7, 61, 'Elle propose des cours de français bienveillants, adaptés aux objectifs de chaque élève.', ['francais', 'histoire-geographie'], [1, 2, 3, 4, 5]],
            ['Noah', 'Michel', 8, 4.9, 174, 'Tuteur en SVT et en informatique, il relie les cours à des exemples du quotidien.', ['sciences-de-la-vie-et-de-la-terre', 'informatique'], [2, 3, 4, 5, 6, 7]],
        ];

        foreach ($tutors as $index => [$firstName, $lastName, $experience, $rating, $lessons, $bio, $subjectSlugs, $levelRanks]) {
            $tutor = Tutor::updateOrCreate(
                ['first_name' => $firstName, 'last_name' => $lastName],
                [
                    'photo_url' => 'https://i.pravatar.cc/240?img='.(($index + 12) % 70 + 1),
                    'experience_years' => $experience,
                    'bio' => $bio,
                    'rating' => $rating,
                    'completed_lessons' => $lessons,
                    'is_active' => true,
                ],
            );

            $tutor->subjects()->sync(collect($subjectSlugs)->map(fn ($slug) => $subjects[$slug]->id)->all());
            $tutor->schoolLevels()->sync(collect($levelRanks)->map(fn ($rank) => $levels[$rank]->id)->all());

            // Six upcoming 60-minute slots per tutor, spread across the next two weeks.
            foreach ([1, 3, 5, 8, 10, 12] as $dayOffset) {
                $start = CarbonImmutable::now(config('app.timezone'))
                    ->addDays($dayOffset)
                    ->setTime(9 + (($index + $dayOffset) % 5) * 2, 0);

                TutorAvailability::firstOrCreate(
                    ['tutor_id' => $tutor->id, 'starts_at' => $start, 'ends_at' => $start->addHour()],
                );
            }
        }
    }
}

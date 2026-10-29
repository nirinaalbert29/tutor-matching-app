# API de mise en relation avec un tuteur

API Laravel pour rechercher des tuteurs selon la matière, le niveau scolaire et les créneaux demandés, puis réserver un cours.

## Installation locale

Prérequis : PHP 8.2+, Composer et PostgreSQL.

1. Copier `.env.example` vers `.env` si le fichier n'existe pas, puis renseigner `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` et `DB_PASSWORD` pour PostgreSQL.
2. Depuis le dossier `backend`, installer les dépendances et créer la clé :

   ```sh
   composer install
   php artisan key:generate
   ```

3. Créer le schéma et les données de démonstration :

   ```sh
   php artisan migrate --seed
   ```

4. Démarrer l'API :

   ```sh
   php artisan serve
   ```

L'API est disponible sur `http://localhost:8000/api`. Les migrations Laravel fonctionnent aussi avec SQLite pour un démarrage rapide. Configurez `FRONTEND_URL` pour autoriser l'origine Vite de l'interface.

## Routes

| Méthode | Route | Usage |
| --- | --- | --- |
| `GET` | `/api/catalog` | Liste les matières et niveaux disponibles. |
| `GET` | `/api/tutors?subject_id=1&school_level_id=2` | Liste les tuteurs actifs, filtres facultatifs. |
| `POST` | `/api/matches` | Applique les critères obligatoires et classe les tuteurs compatibles. |
| `POST` | `/api/bookings` | Réserve un créneau libre et confirme le cours. |
| `GET` | `/api/bookings/{reference}` | Récupère une confirmation à partir de sa référence UUID. |

### Recherche de tuteurs

Envoyer `Content-Type: application/json` et `Accept: application/json` :

```json
{
  "subject_id": 1,
  "school_level_id": 5,
  "availability": [
    { "start_at": "2026-11-01T09:00:00Z", "end_at": "2026-11-01T12:00:00Z" },
    { "start_at": "2026-11-03T13:00:00Z", "end_at": "2026-11-03T17:00:00Z" }
  ]
}
```

Chaque créneau proposé tient entièrement dans au moins une plage demandée. La matière, le niveau, le statut actif et la disponibilité filtrent d'abord les résultats. Le classement facultatif attribue jusqu'à 50 points à la note, 30 à l'expérience et 20 aux cours déjà réalisés.

### Réservation

Utiliser le `tutor_id` et un `availability_id` retournés par `/api/matches` :

```json
{
  "tutor_id": 1,
  "availability_id": 1,
  "subject_id": 1,
  "school_level_id": 5,
  "parent_name": "Camille Martin",
  "parent_email": "camille@example.com",
  "student_name": "Alex Martin",
  "notes": "Préparation au contrôle de mathématiques"
}
```

La réservation est créée en transaction et une contrainte unique en base empêche de réserver deux fois le même créneau, même si plusieurs demandes arrivent en même temps. Une réservation réussie renvoie `201` et une référence de confirmation. Si le créneau a été pris entre-temps, l'API renvoie `409`.

## Données de démonstration

Le seeder crée 12 tuteurs, 8 matières, 7 niveaux scolaires et des créneaux à venir. Il est réexécutable sans supprimer les réservations enregistrées.

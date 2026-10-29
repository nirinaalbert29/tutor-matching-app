# Tutora — interface de recherche et réservation

Interface React responsive connectée à l'API Laravel. Elle charge les matières et niveaux depuis le catalogue, recherche de vrais tuteurs compatibles et confirme les réservations via l'API.

## Démarrer en local

Lancer d'abord le backend Laravel avec sa base et ses données :

```sh
cd backend
php artisan serve
```

Dans un autre terminal :

```sh
cd frontend
npm install
npm run dev
```

Ouvrir l'adresse locale affichée par Vite. Le proxy de développement transmet les requêtes `/api` à `http://127.0.0.1:8000`. Pour utiliser une autre adresse, créer un fichier `.env.local` depuis `.env.example` et définir `VITE_BACKEND_URL`. `VITE_API_URL` permet, en option, d'indiquer directement l'URL complète de l'API.

## Parcours

Choisir une matière, un niveau, une période de 1 à 15 jours et jusqu'à deux plages horaires quotidiennes. L'interface envoie ces préférences à `/api/matches`, affiche les profils et les créneaux réels renvoyés par le backend, puis collecte les coordonnées du parent au moment de réserver. La confirmation affiche la référence renvoyée par `/api/bookings`.

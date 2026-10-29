<?php

use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\MatchController;
use App\Http\Controllers\Api\TutorController;
use Illuminate\Support\Facades\Route;

Route::get('/catalog', CatalogController::class);
Route::get('/tutors', [TutorController::class, 'index']);
Route::post('/matches', MatchController::class);
Route::post('/bookings', [BookingController::class, 'store'])->middleware('throttle:30,1');
Route::get('/bookings/{reference}', [BookingController::class, 'show']);

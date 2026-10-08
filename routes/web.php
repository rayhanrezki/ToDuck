<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'duck-dashboard')->name('home');
Route::inertia('/dashboard', 'duck-dashboard')->name('dashboard');
Route::inertia('/tasks', 'duck-dashboard')->name('tasks');
Route::inertia('/schedule', 'duck-dashboard')->name('schedule');
Route::inertia('/timer', 'duck-dashboard')->name('timer');
Route::inertia('/settings', 'duck-dashboard')->name('settings');

// Redirect any legacy auth routes directly to home
Route::get('/login', fn () => redirect('/'))->name('login');
Route::get('/register', fn () => redirect('/'))->name('register');
Route::get('/forgot-password', fn () => redirect('/'))->name('password.request');

require __DIR__.'/settings.php';



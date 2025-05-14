# Lockbox

This repository contains our team's technical **Proof of Concept (PoC)** for **Lockbox** - our time capsule vlogging app which records your memories and locks them away for later. It demonstrates core features across the React Native frontend, Node.js backend, and Supabase database, laying the groundwork for a scalable and secure architecture.

## Features
This PoC showcases Lockbox’s core functionality, built with a **React Native** frontend, a **Node.js** backend for clean separation of concerns, and **Supabase** for authentication and data storage.
1. User authentication (login/signup)
Users can create a new account and log in, supported by **Supabase Auth** with email confirmation. Navigation is gated between `(auth)` and `(protected)` routes using **Expo Router**. Users can securely log out, with session states handled by tokens.

2. Trip dashboard
Frontend for trip dashboard created, with filters to select upcoming, ongoing, and past trips. Filter logic is handled on frontend.

4. Trip creation with title, dates, location, thumbnail
Our PoC demonstrates how users create trips with titles, start & end dates (via a custom date modal), location (via a country picker), and thumbnail (image picker integrated) through the frontend.
   
5. Profile updation
Users can edit their profile names, bios, and avatars which gets posted to supabase via our custom backend API. Avatars are uploaded via **custom Node.js backend** to **Supabase Storage** using Multer.

## Steps to run
1. Clone the repo
```bash
git clone https://github.com/binghangc/lockbox.git
cd lockbox
```
2. Install dependencies
```bash
npm install
```
3. Set up environment by copying .env.example
```bash
cp .env.example .env
```
4. Fill in the missing values
```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=...
EXPO_PUBLIC_API_URL=...
```

As service role keys are private, we will manually share the SERVICE_ROLE_KEY to interested testers. We will use secure methods liks 1Password and Bitwarden to send it through, simply drop either Emilia (e1355432@u.nus.edu) or Bing Hang (e1398132@u.nus.edu).

5. Start frontend
```bash
npm start -- --clear
```
6. Start backend
```bash
node server/server.js
```
## Notes
Trip features are not fully integrated to backend yet. 
Confirmation emails and reset password emails do not redirect back to the app (have yet to settle deep linking)

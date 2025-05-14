# Lockbox
Currently our technical proof of concept (PoC) is in the dev branch.

## Motivation 

In a world of instant gratification and fleeting moments, we strive to encourage others to pause, be present, and smell the flowers (literally) when they're travelling. Social media rewards content that is carefully curated and staged over unpolished, raw memories. However, as travel enthusiasts, we have noticed that the most meaningful memories are not those captured for public consumption, but rather the raw unfiltered experiences we laugh about years later.

Current travel and photo apps focus on storage, rather than experience. They are built for utility, and do not fully capture the essence of nostalgia. With Gen Z's desire for authenticity, we believe there is a growing need for a tool which honors the spontaneous spirit of travel.

Our app, Lockbox, seeks to satisfy this appetite by capturing the real, uncensored essence of group travel: the inside jokes, the awkward moments, and all those special experiences that make travelling fun. It acts as a memory capsule to let people preserve and relive the essence of travel by capturing moments as they happen, locking them away, and later unlocking them to relive them again.

## Aim 

We aim to create Lockbox, a time-capsule travel vlogging app that enables groups of friends (or solo travellers) to document their trips in a fun, interactive, and authentic way. Users can send in-app invites to friends to join a trip and contribute to a shared memory vault. Throughout the journey, instead of instantly sharing content with the whole world, users receive personalised prompts called vibe checks and respond to them by recording short clips that remain locked in a vault until a set time (such as after a trip or at the end of the day). Once the vault unlocks, everyone on the trip can access and view each other’s responses and memories - like Spotify Wrapped, but for travel memories!

## Liftoff (Current)
During Liftoff (May 12 - May 19), our primary goal is to complete a prototype with basic user authentication and session management. During this period, we will set up our development environment, such as our Git branching strategy. We will also take the time to familiarise ourselves with our desired tech stack, namely React Native, Node.js, and Supabase.

### 1. User management and authentication (Feature 1)
Implement sign up and login features with a username and password. 
Set up a user and session database for user and session management.
Set up authentication mechanisms, including password hashing
Feature for users to customise profile picture, name and bio.

### 2. Invites/Trips (Feature 3/4)
Basic main page interface containing buttons for CRUD trip management
Basic invite creation UI with trip details and send invite buttons
Trips database
Implement role-based access control (RBAC) for hosts vs participants.

## Proposed Tech Stack
React Native (frontend)
Node.js, Express.js (backend)
Supabase (database)
Cloudflare R2 (video and photo storage and CDN)
Mapbox (Map API)
OpenAI API (AI-driven prompt generator)


# SuperStudentTracker

**All-in-one academic companion for courses, schedules, assignments, materials, grades, and to-dos — synced across devices with Firebase.**

[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2054-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20·%20Firestore%20·%20Storage-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-Private-lightgrey)](#license)

---

## Overview

SuperStudentTracker is a cross-platform student productivity app built with **Expo** and **React Native**. It helps you organize an entire semester in one place: weekly schedules, course hubs, assignment pipelines, PDF materials, grade breakdowns, attendance tolerance, and dependency-aware to-dos — with cloud sync, offline-friendly persistence, and secure per-user data isolation.

| Platform | Status |
| --- | --- |
| iOS | Supported (development / simulator) |
| Android | Supported (development / emulator) |
| Web | Supported via Expo Web |

---

## Features

### Home
- Today-focused dashboard with schedule overview and upcoming work
- Assignment carousel and glass-style task blocks for quick scanning
- Course schedule grid wired to live course data

### Courses
- Create and edit courses (title, lecturer, cover image, absence tolerance)
- Weekly schedule slots with overlap detection
- Course detail hub for grades, assignments, materials, and attendance

### Schedule
- Week view of class slots across all courses
- Location-aware time blocks

### Assignments
- Typed assignments (essay, exam, quiz, group project, and more)
- Priority levels and status tracking (`not_started` → `in_progress` → `pending_review`)
- Inline edit on a dedicated detail screen
- Linked to-dos per assignment

### To-dos
- Global task list across courses and assignments
- Prerequisites, deadlines, filters, and sorting
- Shared between Home, course views, and the Tasks tab

### Materials
- Upload PDFs, documents, images, and links
- Nested user-defined folders
- In-app PDF viewer (including password-protected files)
- Filter, sort, and explore materials per course

### Grades & attendance
- Weighted grade breakdown with editable score labels
- Absence tracking against per-course tolerance hours

### Auth & account
- Email / password with verification and password reset
- Google Sign-In (native + web)
- Apple Sign-In (native + web)
- Account settings: change password, resend verification, delete account

### Notifications & polish
- Local notification support via Expo Notifications
- Light / dark aware theming and haptics
- Persistent Firestore cache and SQLite-backed local caching

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Expo SDK 54, Expo Router (file-based routing) |
| UI | React 19, React Native 0.81, Reanimated, Gesture Handler |
| Language | TypeScript |
| State & data | Zustand, TanStack React Query |
| Backend | Firebase Auth, Cloud Firestore, Cloud Storage |
| Local cache | Firestore persistent local cache, Expo SQLite |
| Auth providers | Email/Password, Google, Apple |
| Testing | Vitest |
| Lint | ESLint (`eslint-config-expo`) |

---

## Project structure

```
SuperStudentTracker/
├── app/                    # Expo Router screens & layouts
│   ├── (auth)/             # Sign-in / sign-up
│   └── (app)/              # Authenticated app shell
│       ├── (tabs)/         # Home, Schedule, Courses, To-do's, Settings
│       └── course/         # Course detail, grades, assignments, materials
├── features/               # Domain modules (api, hooks, screens, components)
│   ├── assignments/
│   ├── attendance/
│   ├── auth/
│   ├── courses/
│   ├── grades/
│   ├── home/
│   ├── materials/
│   ├── notifications/
│   ├── notes/
│   ├── schedule/
│   ├── tasks/
│   └── todos/
├── components/             # Shared UI building blocks
├── constants/              # Theme, options, visual tokens
├── hooks/                  # Shared React hooks
├── lib/                    # Firebase, persistence, theme, utilities
├── store/                  # Zustand stores
├── types/                  # Shared TypeScript domain types
├── scripts/                # Seed & scaffold helpers
├── assets/                 # Icons, splash, fonts
├── firestore.rules         # Per-user Firestore security rules
├── storage.rules           # Per-user Storage security rules
└── .env.example            # Required public env vars
```

Feature modules follow a consistent layout: `api/` · `hooks/` · `components/` · `screens/` — keeping domain logic close to the UI that owns it.

---

## Prerequisites

- **Node.js** 20+ (LTS recommended)
- **npm** 10+
- **Expo CLI** (via `npx`, no global install required)
- A **Firebase** project with Auth, Firestore, and Storage enabled
- For iOS simulator: macOS with Xcode
- For Android emulator: Android Studio

---

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/hsnefe/SuperStudentTracker.git
cd SuperStudentTracker
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in values from the Firebase Console (**Project settings → Your apps → Web app**):

| Variable | Description |
| --- | --- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Web API key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | `{project-id}.firebaseapp.com` |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Web app ID |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth web client ID |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google OAuth iOS client ID |
| `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` | Google OAuth Android client ID |

> Never commit `.env`. Only `EXPO_PUBLIC_*` keys are embedded in the client bundle; treat them as public configuration and protect data with Firebase Security Rules.

### 4. Configure Firebase Auth

In Firebase Console → **Authentication → Sign-in method**, enable:

1. **Email/Password** (required for register / login)
2. **Google** (optional; requires OAuth client IDs above)
3. **Apple** (optional; required for App Store distribution if Google is offered)

Deploy security rules:

```bash
npx firebase deploy --only firestore:rules,storage
```

### 5. Start the app

```bash
npm start
```

Then press:

- `i` — iOS simulator  
- `a` — Android emulator  
- `w` — web browser  

Or target a platform directly:

```bash
npm run ios
npm run web
```

---

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start Expo development server |
| `npm run ios` | Start on iOS |
| `npm run web` | Start on web |
| `npm run web:8082` | Start web on port 8082 |
| `npm run lint` | Run ESLint via Expo |
| `npm test` | Run Vitest unit tests |
| `npx firebase deploy --only firestore:rules,storage` | Deploy security rules |

Optional seed script (development data):

```bash
node scripts/seed-firestore.mjs
```

---

## Architecture notes

### Routing
Expo Router drives navigation. Auth screens live under `app/(auth)`; the signed-in experience under `app/(app)` with tab navigation and nested course routes.

### Data model
User data is scoped under Firestore paths such as `users/{uid}/...`. Storage objects live under `courses/{uid}/...`. Rules enforce that only the authenticated owner can read or write their documents and files.

### Client data flow
1. Feature `api/` modules talk to Firebase Auth / Firestore / Storage  
2. React Query (and feature hooks) manage server state and invalidation  
3. Zustand stores hold ephemeral UI state (material viewer, navigation transitions)  
4. Persistence helpers and SQLite cache improve offline / cold-start experience  

### Security
- Firestore: `users/{userId}/**` — owner-only  
- Storage: `courses/{userId}/**` — owner-only  
- Email verification flow is built into sign-up and settings  

---

## Development

```bash
# Type-aware lint
npm run lint

# Unit tests
npm test
```

Recommended workflow:

1. Prefer changes inside the relevant `features/<domain>/` module  
2. Keep shared types in `types/`  
3. Reuse theme tokens from `constants/` and `lib/theme`  
4. Match existing naming: `CreateXInput`, `UpdateXInput`, screen/component suffixes  

---

## Environment & configuration checklist

- [ ] `.env` created from `.env.example`  
- [ ] Firebase Web app credentials set  
- [ ] Email/Password auth enabled  
- [ ] Google / Apple clients configured (if using social login)  
- [ ] Firestore + Storage rules deployed  
- [ ] `npm install` completed  
- [ ] App starts with `npm start`  

---

## Roadmap ideas

- Deeper notes / block editor integration  
- Richer push notification scheduling for deadlines  
- Tablet-optimized layouts  
- Export / share semester summaries  

---

## Contributing

This project is currently private. If you have access:

1. Create a feature branch from `main`  
2. Keep commits focused and conventional (`feat`, `fix`, `chore`, …)  
3. Run `npm run lint` and `npm test` before opening a PR  
4. Describe the user-facing impact in the PR body  

---

## License

Private — all rights reserved. Unauthorized copying or distribution is prohibited.

---

## Acknowledgments

Built with [Expo](https://expo.dev), [React Native](https://reactnative.dev), [Firebase](https://firebase.google.com), [TanStack Query](https://tanstack.com/query), and [Zustand](https://zustand-demo.pmnd.rs).

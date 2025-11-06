# 🧠 AI Mental Health Companion

> A comprehensive web application providing mental health support through AI-powered chat therapy, journaling, mood tracking, and personalized insights.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-ES_Modules-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748.svg)](https://www.prisma.io/)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [System Workflow](#-system-workflow)
  - [1. User Authentication & Onboarding](#1-user-authentication--onboarding)
  - [2. User Dashboard & Personalization](#2-user-dashboard--personalization)
  - [3. AI Chat System](#3-ai-chat-system)
  - [4. Journaling System](#4-journaling-system)
  - [5. Mood Logging System](#5-mood-logging-system)
  - [6. Therapy Plan System](#6-therapy-plan-system)
  - [7. AI Recommendations](#7-ai-recommendations)
  - [8. Insights & Summaries](#8-insights--summaries)
  - [9. Notifications & Reminders](#9-notifications--reminders)
  - [10. System & Data Flow](#10-system--data-flow-overview)
- [Technology Stack](#-technology-stack)
- [Project Development Journey](#-project-development-journey)
  - [Section 0: Project Setup and Backend Deployment](#section-0-project-setup-and-backend-deployment)
  - [Section 1: Data Modeling and Prisma Schema](#section-1-data-modeling-and-prisma-schema)
  - [Section 2: Backend Features and File Upload](#section-2-backend-features-and-file-upload)
  - [Section 3: Frontend Setup, Authentication Pages, and OAuth](#section-3-frontend-setup-authentication-pages-and-oauth)
- [Key Achievements](#-key-achievements)
- [Next Steps](#-next-steps)
- [Notes & Custom Inputs](#-notes--custom-inputs)

---

## 🎯 Project Overview

AI Mental Health Companion is a web application designed to provide mental health support, journaling, mood tracking, AI chat therapy, and personalized insights. The system integrates AI-driven recommendations with a user-friendly interface and ensures data security and privacy.

---

## 🔄 System Workflow

### 1. User Authentication & Onboarding

#### 1.1 Sign Up / Registration
Users can register using:

- Email & Password (traditional sign-up)
- Google OAuth (via Google Sign-In)

A new User record is created with fields: fullName, email, and profileImageUrl.

A welcome email is sent via Nodemailer (Gmail SMTP).

#### 1.2 Login
Login methods:

- Email & Password (bcrypt verification)
- Google OAuth token verification

After login:

- JWT access & refresh tokens created
- Preferences loaded

#### 1.3 Password Reset (Forgot Password Flow)
Reset token created, emailed, and verified upon password update.

#### 1.4 Session & Token Refresh
Refresh tokens update access tokens; logout clears tokens.

---

### 2. User Dashboard & Personalization

#### 2.1 Dashboard Overview
Dashboard includes:

- Profile details
- Mood overview & analytics
- Journaling summary
- AI chat history
- Therapy goals
- Recommendations feed

#### 2.2 User Preferences
Preferences stored in UserPreference:

- Theme (Light/Dark)
- AI Tone (Empathetic/Neutral/Motivational)
- Daily reminder toggle

---

### 3. AI Chat System

#### 3.1 New Chat Session
AiSession created with startedAt and userId.

#### 3.2 Message Exchange
Messages stored in AiMessage with sessionId, sender, message, timestamp.

#### 3.3 AI Behavior
AI tone adapts to user preference.

#### 3.4 Session End
Session ends with endedAt; AI summary stored in Insight.

---

### 4. Journaling System

#### 4.1 Add Journal Entry
User adds title, content, mood; stored in Journal table.

#### 4.2 Journal Insights
System analyzes journals for patterns and updates Insight.journalingPattern.

---

### 5. Mood Logging System

#### 5.1 Logging Moods
User logs mood, energyLevel, stressLevel, note.

#### 5.2 Mood Visualization
Dashboard displays mood trends; insights stored in Insight.moodSummary.

---

### 6. Therapy Plan System

#### 6.1 Plan Creation
AI or user defines goals stored in TherapyPlan.

#### 6.2 Plan Progress
Progress marked manually or via AI suggestions.

---

### 7. AI Recommendations

#### 7.1 Recommendation Generation
AI generates recommendations stored in Recommendation model.

#### 7.2 Display & Update
Recommendations appear in dashboard; user marks helpful/done.

---

### 8. Insights & Summaries

#### 8.1 Insight Generation
System compiles patterns from journals, moods, and AI sessions.

#### 8.2 Insight Display
Dashboard shows summaries and progress trends.

---

### 9. Notifications & Reminders

Daily reminders sent if enabled. Email or in app notifications used.

---

### 10. System & Data Flow (Overview)

#### 10.1 Data Flow Summary

- Frontend (React) → Axios → Backend (Express) → Prisma ORM → PostgreSQL DB
- Cloudinary → stores user images
- Nodemailer → handles emails
- JWT Auth → secures all routes

#### 10.2 Key Integration Points

- Google OAuth → quick onboarding
- Prisma → consistent relational mapping
- Tailwind + Shadcn → unified UI
- Vercel + Railway → scalable, serverless deployment

---

## 🛠️ Technology Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **OAuth**: @react-oauth/google
- **Image Cropping**: react-easy-crop
- **Routing**: React Router v6

### Backend

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon/Supabase)
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken), bcrypt
- **OAuth**: google-auth-library
- **Image Storage**: Cloudinary
- **Email**: Nodemailer (Gmail SMTP)
- **Security**: express-rate-limit, cookie-parser, cors
- **File Upload**: Multer (memory storage for serverless)

### DevOps

- **Deployment**: Vercel (serverless)
- **Version Control**: Git + GitHub
- **Database Hosting**: Railway (PostgreSQL)
- **CDN**: Cloudinary

---

## 📚 Project Development Journey

### Section 0: Project Setup and Backend Deployment

**Goal**: Establish a fully functional backend, connect it to a database, and deploy it for live development.

**Key Work Done**:
- Created a GitHub repository with a backend folder
- Selected PostgreSQL as the primary database and hosted it on Railway (free tier)
- Integrated Prisma ORM for database access and schema management
- Tested basic health and API endpoints
- Configured Vercel deployment using vercel.json with includeFiles for backend and Prisma files
- Managed environment variables securely through Vercel secrets
- Successfully deployed backend API to live environment for testing

**Challenges & Resolutions**:
- Fixed 404 route issues by mapping routes correctly in vercel.json
- Resolved missing DATABASE_URL variable in deployment
- Learned how to push Prisma migrations and connect Railway database with Vercel

---

### Section 1: Data Modeling and Prisma Schema

**Goal**: Design the data model structure, define relationships, and connect Prisma schema to the Railway-hosted database.

**Key Work Done**:
- Designed and implemented core models:
  - Users (profile info, email, gender, age, image URL, timestamps)
  - Journals (daily entries, optional mood)
  - Mood Logs (daily mood/stress/energy levels)
  - AI Sessions and Messages
  - Therapy Plans, Recommendations, and Preferences
  - Insights (summarized mood and journaling data)
- Added relations between models and enums for consistency
- Ran initial Prisma migration using `npx prisma migrate dev --name init`
- Understood Prisma lifecycle: schema definition → generate client → apply migration → deploy → CRUD

**Enhancements**:
- Added `profileImageUrl` and `updatedAt` fields in the user schema
- Added enum validation for sender and theme fields
- Validated the schema with visual schema mapping and entity relationships

#### 📘 Prisma Data Model Documentation

#### 1️⃣ ENUM TYPES

**SenderType**: `user` | `ai`  
**ThemeType**: `light` | `dark`  
**AiToneType**: `empathetic` | `neutral` | `motivational`

#### User

| Field | Type | Attributes / Notes |
|-------|------|-------------------|
| **id** | Int | @id, @default(autoincrement()) |
| **fullName** | String? | Optional, mapped as full_name |
| **email** | String | @unique |
| **passwordHash** | String? | Nullable for OAuth users |
| **age** | Int? | Optional |
| **gender** | String? | Optional |
| **profileImageUrl** | String? | Profile image URL |
| **resetToken** | String? | For password reset |
| **resetTokenExpiry** | DateTime? | Reset token expiry time |
| **refreshToken** | String? | For refresh token system |
| **googleId** | String? | @unique, For Google OAuth |
| **createdAt** | DateTime | @default(now()) |
| **updatedAt** | DateTime | @default(now()), @updatedAt |
| **journals** | Journal[] | Relation 1–M |
| **moodLogs** | MoodLog[] | Relation 1–M |
| **aiSessions** | AiSession[] | Relation 1–M |
| **recommendations** | Recommendation[] | Relation 1–M |
| **therapyPlans** | TherapyPlan[] | Relation 1–M |
| **preferences** | UserPreference? | Relation 1–1 |
| **insights** | Insight[] | Relation 1–M |

#### Journal

| Field | Type | Attributes / Notes |
|-------|------|-------------------|
| **id** | Int | @id, @default(autoincrement()) |
| **userId** | Int | FK → User |
| **title** | String? | Optional |
| **content** | String? | Journal entry content |
| **mood** | String? | Mood tag |
| **createdAt** | DateTime | @default(now()) |

#### MoodLog

| Field | Type | Attributes / Notes |
|-------|------|-------------------|
| **id** | Int | @id, @default(autoincrement()) |
| **userId** | Int | FK → User |
| **mood** | String | User's mood description |
| **energyLevel** | Int | Mapped as energy_level |
| **stressLevel** | Int | Mapped as stress_level |
| **note** | String? | Optional note |
| **loggedAt** | DateTime | @default(now()) |

#### AiSession

| Field | Type | Attributes / Notes |
|-------|------|-------------------|
| **id** | Int | @id, @default(autoincrement()) |
| **userId** | Int | FK → User |
| **title** | String? | Optional title |
| **startedAt** | DateTime | @default(now()) |
| **endedAt** | DateTime? | Nullable |
| **messages** | AiMessage[] | Relation 1–M |

#### AiMessage

| Field | Type | Attributes / Notes |
|-------|------|-------------------|
| **id** | Int | @id, @default(autoincrement()) |
| **sessionId** | Int | FK → AiSession |
| **sender** | SenderType | Enum: user or ai |
| **message** | String | Message content |
| **createdAt** | DateTime | @default(now()) |

#### Recommendation

| Field | Type | Attributes / Notes |
|-------|------|-------------------|
| **id** | Int | @id, @default(autoincrement()) |
| **userId** | Int | FK → User |
| **category** | String? | Recommendation category |
| **title** | String? | Recommendation title |
| **description** | String? | Recommendation details |
| **createdAt** | DateTime | @default(now()) |

#### TherapyPlan

| Field | Type | Attributes / Notes |
|-------|------|-------------------|
| **id** | Int | @id, @default(autoincrement()) |
| **userId** | Int | FK → User |
| **goalTitle** | String? | Therapy goal title |
| **goalDescription** | String? | Therapy goal details |
| **progress** | Int | @default(0) |
| **createdAt** | DateTime | @default(now()) |

#### UserPreference

| Field | Type | Attributes / Notes |
|-------|------|-------------------|
| **id** | Int | @id, @default(autoincrement()) |
| **userId** | Int | @unique, FK → User |
| **theme** | ThemeType | @default(light) |
| **aiTone** | AiToneType | @default(empathetic) |
| **dailyReminder** | Boolean | @default(true) |

#### Insight

| Field | Type | Attributes / Notes |
|-------|------|-------------------|
| **id** | Int | @id, @default(autoincrement()) |
| **userId** | Int | FK → User |
| **moodSummary** | String? | Summarized mood trend |
| **journalingPattern** | String? | Pattern derived from journals |
| **aiSummary** | String? | AI-generated insight summary |
| **generatedAt** | DateTime | @default(now()) |

---

### Section 2: Backend Features and File Upload

**Goal**: Build authentication, user management, and image upload functionality.

**Key Work Done**:
- Implemented authentication (JWT-based):
  - Register user with bcrypt password hashing
  - Login endpoint generating JWT access tokens
  - Default preferences created automatically on registration
- Integrated Multer + Cloudinary for file upload
- Uploaded profile images to Cloudinary and stored URLs in DB
- Implemented `updateUser` API endpoint to manage profile data
- Tested APIs in live environment using deployed backend endpoints

**Challenges & Resolutions**:
- Fixed file upload issues in live Vercel environment
- Handled optional file upload and default null values for images

---

### Section 3: Frontend Setup, Authentication Pages, and OAuth

**Goal**: Build and deploy frontend with authentication, password reset, and Google OAuth integration.

**Key Work Done**:
- Developed Angular frontend with Login, Signup, and Dashboard pages
- Integrated with live backend API endpoints
- Implemented password reset system via Gmail SMTP
- Built JWT-based session and token management
- Added Google OAuth login:
  - User profile synced with backend (name, email, image)
  - Fallback for missing profile image
- Deployed frontend with backend on Vercel
- Merged build and route configuration in vercel.json for both layers

**Challenges & Resolutions**:
- Fixed Google profile image load error (429) using caching and fallback strategies
- Configured environment variables for live deployment ports
- Resolved submodule issues and unified repo structure for Vercel

---

## 🏆 Key Achievements

1. Backend and database deployed with PostgreSQL + Prisma
2. Complete data schema for AI mental health features implemented
3. Secure authentication and user management functional
4. Frontend integrated and deployed with OAuth and password reset

---

## 🚀 Next Steps

- Implement AI chat logic and journaling insight generation
- Display session history and daily recommendations
- Add rate limiting, improved error handling, and token refresh flow
- Integrate sentiment analysis and daily motivational insights

---

## 📝 Notes & Custom Inputs

Use this section to add screenshots, diagrams, or extra notes about your implementation details, challenges, or code improvements.

- **Notes**:
- **Observations**:
- **Planned enhancements**:

---

*Built with ❤️ for mental health support*

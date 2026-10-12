# LearnLoop

LearnLoop is a modern school management web app for administrators, teachers, and students. It is built with React, Vite, TypeScript, Tailwind CSS, and Supabase.

## Stack
- React + Vite + TypeScript
- Tailwind CSS
- Supabase JavaScript client
- React Router

## Project requirements
This frontend is designed for an existing Supabase project and database. It reuses the current schema and avoids creating or changing the database from the frontend.

Important security notes:
- Use the Supabase project URL and anon key only in the browser.
- Never include a service-role key in frontend code.
- Treat Supabase Row Level Security as the security boundary.
- Route guards are only for UX; they do not replace database policy enforcement.
- Do not hardcode credentials or store passwords in the profiles table.

## Local setup
1. Clone the project.
2. Install dependencies:
   npm install
3. Copy `.env.example` to `.env` and update the values.
4. Run the app:
   npm run dev
5. Open the local URL shown by Vite.

## Environment variables
Create a `.env` file from `.env.example` with:

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

## Trusted login flow
The app uses a school-issued user ID login flow through a trusted backend lookup, then signs in to Supabase Auth using the mapped email.

This means the browser client never reads private email values directly from an unrestricted table and never bypasses RLS.

The project expects one of these backend RPC functions to exist in Supabase to resolve the login and return a mapped email:
- resolve_school_login
- authenticate_school_user
- school_user_login
- lookup_school_user

If your project does not provide one of those RPCs, sign-in will fail with a friendly message and the frontend will not proceed.

## Roles
The dashboard supports:
- school_admin
- teacher
- student

## Deployment
Use the same environment variables in the host environment for deployments (Vercel, Netlify, Cloudflare Pages, or any static host that supports Vite builds).

Build command:
npm run build

Then publish the generated `dist` folder.

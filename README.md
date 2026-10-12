# LearnLoop

LearnLoop is a modern school management web app for administrators, teachers, and students. It is built with React, Vite, TypeScript, and Tailwind CSS.

## Stack
- React + Vite + TypeScript
- Tailwind CSS
- React Router

## Project requirements
This frontend is designed to run without any external database service. It uses a local mock authentication flow and sample school data so that the app can be opened and tested immediately in a browser.

## Local setup
1. Clone the project.
2. Install dependencies:
   npm install
3. Run the app:
   npm run dev
4. Open the local URL shown by Vite.

## Demo login
The app includes a no-database demo login flow.

Use any of these IDs with the password `demo123`:
- ADMIN-001
- T-2048
- ST-3001

## Roles
The dashboard supports:
- school_admin
- teacher
- student

## Deployment
Use the standard Vite build process for deployments.

Build command:
npm run build

Then publish the generated `dist` folder.

# ICAMS

ICAMS is a web system for managing ICT assets, maintenance records, QR code scanning, feedback, and user accounts.

Live system:
`https://icams-prk.vercel.app/login`

## What You Need

Before running this system, make sure you have:

- Node.js 20 or newer
- npm
- A Supabase project

## Important Environment Variables

Create a file named `.env.local` in the project root and add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
MAINTENANCE_SCHEDULER_SECRET=your_scheduler_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

What these mean:

- `NEXT_PUBLIC_SUPABASE_URL`
  Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  Public key used by the app
- `SUPABASE_SERVICE_ROLE_KEY`
  Needed for admin actions like inviting users
- `NEXT_PUBLIC_SITE_URL`
  Used to create login and invite links
- `MAINTENANCE_SCHEDULER_SECRET`
  Secret used by the maintenance scheduler endpoint for cron execution
- `GEMINI_API_KEY`
  API key for the maintenance troubleshooting assistant powered by Gemini
- `GEMINI_MODEL`
  Optional Gemini model override for the assistant route. Default is `gemini-2.5-flash`

Important:

- In local development, use `http://localhost:3000`
- In Vercel production, use your deployed URL such as `https://icams-prk.vercel.app`
- Never share or commit your real secret keys
- In Vercel, you may use either `MAINTENANCE_SCHEDULER_SECRET` or `CRON_SECRET`

## How To Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open this in your browser:

```text
http://localhost:3000
```

The system will redirect you to:

```text
http://localhost:3000/login
```

## How To Build For Production

Run:

```bash
npm run build
```

If the build is successful, start it with:

```bash
npm run start
```

## How To Deploy On Vercel

1. Push the project to GitHub
2. Import the repository into Vercel
3. Add the same environment variables in Vercel
4. Set:

```env
NEXT_PUBLIC_SITE_URL=https://icams-prk.vercel.app
MAINTENANCE_SCHEDULER_SECRET=your_scheduler_secret
```

5. Deploy

### Maintenance Scheduler

This project includes a Vercel cron entry in `vercel.json`:

```text
/api/maintenance/run-scheduler
```

Recommended setup:

- set `MAINTENANCE_SCHEDULER_SECRET` in Vercel
- or set `CRON_SECRET` if you want to follow Vercel cron secret convention

The scheduler is used to:

- auto-create preventive maintenance requests
- send due soon alerts
- send overdue alerts

## Important Supabase Setup

In Supabase, go to:

`Authentication` -> `URL Configuration`

Add these URLs.

For local:

```text
http://localhost:3000
http://localhost:3000/login
http://localhost:3000/register
```

For production:

```text
https://icams-prk.vercel.app
https://icams-prk.vercel.app/login
https://icams-prk.vercel.app/register
```

This part is very important. If these URLs are wrong:

- invite email links may not work
- login redirects may fail
- account setup links may open the wrong page

## Main Features

- User login
- User invitation by admin
- Asset management
- QR code scanning
- Maintenance tracking
- Feedback management
- Role-based access for admin, assistant, and staff

## Common Problems

### Invite link does not open properly

Check:

- `NEXT_PUBLIC_SITE_URL`
- Supabase redirect URLs
- Vercel environment variables

                                                                           ### Camera cannot be used for QR scan

Check:

- browser permission
- HTTPS in production
- device camera availability

### Admin user management does not work

Check:

- `SUPABASE_SERVICE_ROLE_KEY`

## Main Pages

- Login: `/login`
- Register / invite setup: `/register`
- Admin users page: admin user management inside dashboard

## Summary

To run this system successfully, focus on these 4 things:

1. Install dependencies with `npm install`
2. Set `.env.local` correctly
3. Run with `npm run dev`
4. Configure Supabase redirect URLs correctly

If those 4 parts are correct, the system should run properly.

ICAMS
Integrated Computerized Asset Management System

Live system:
https://icams-prk.vercel.app/login

==================================================
1. WHAT THIS SYSTEM DOES
==================================================

ICAMS is a web system used to manage:
- ICT assets
- maintenance records
- QR code scanning
- feedback
- user accounts and roles


==================================================
2. WHAT YOU NEED BEFORE RUNNING
==================================================

Make sure you have:
- Node.js version 20 or newer
- npm
- a Supabase project


==================================================
3. REQUIRED ENVIRONMENT VARIABLES
==================================================

Create a file named .env.local in the project root.

Add this:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

Meaning:
- NEXT_PUBLIC_SUPABASE_URL
  Supabase project URL

- NEXT_PUBLIC_SUPABASE_ANON_KEY
  Public key used by the app

- SUPABASE_SERVICE_ROLE_KEY
  Used for admin actions such as inviting users

- NEXT_PUBLIC_SITE_URL
  Used to create login and invite links

Important:
- For local use, set NEXT_PUBLIC_SITE_URL=http://localhost:3000
- For Vercel deployment, set NEXT_PUBLIC_SITE_URL=https://icams-prk.vercel.app
- Do not share secret keys publicly


==================================================
4. RUN LOCALLY
==================================================

Use this section if you want to run the system on your own computer.

Step 1:
Install dependencies

Command:
npm install

Step 2:
Create and fill in .env.local

Make sure these values exist:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

Step 3:
Start the development server

Command:
npm run dev

Step 4:
Open the browser and go to:

http://localhost:3000

The system will redirect to:

http://localhost:3000/login


==================================================
5. USE THE LIVE SYSTEM
==================================================

Use this section if you only want to access the deployed system without running code locally.

Live link:
https://icams-prk.vercel.app/login

Before using the live system:
- make sure your admin has already created your account or invited you
- make sure the internet connection is available
- allow camera permission if you want to use QR scanning

If you are an invited user:
- open the invite email
- click the link in the email
- complete account setup
- then log in to the system

If the live link opens but some features fail:
- check whether your account has the correct role
- check whether browser camera permission is blocked
- check whether the invite link is old or expired


==================================================
6. HOW TO BUILD THE SYSTEM
==================================================

To create a production build:

Command:
npm run build

If the build is successful, run:

Command:
npm run start


==================================================
7. HOW TO DEPLOY ON VERCEL
==================================================

Step 1:
Push the project to GitHub

Step 2:
Import the repository into Vercel

Step 3:
Add the same environment variables in Vercel

Important production value:

NEXT_PUBLIC_SITE_URL=https://icams-prk.vercel.app

Step 4:
Deploy the project


==================================================
8. IMPORTANT SUPABASE SETUP
==================================================

In Supabase, go to:
Authentication -> URL Configuration

Add these URLs.

For local:
http://localhost:3000
http://localhost:3000/login
http://localhost:3000/register

For production:
https://icams-prk.vercel.app
https://icams-prk.vercel.app/login
https://icams-prk.vercel.app/register

This step is very important.
If these URLs are wrong:
- invite links may not work
- login redirects may fail
- account setup links may open the wrong page


==================================================
9. MAIN FEATURES
==================================================

- user login
- admin invite user
- asset management
- QR code scanning
- maintenance tracking
- feedback management
- role-based access


==================================================
10. LOGIN INFORMATION 
==================================================

Below I list the users that already in this system to
help testing session.
1. Admin: 
- email:hazrinhakim35@gmail.com
- pass:123456789

2. Admin Assistant
- email:qayyumqairel1811@gmail.com
- pass:1122334455

3. Staff
- email:di230094@student.uthm.edu.my
- pass:123123123

==================================================
11. QUICK SUMMARY
==================================================

To run this system properly:

1. Install dependencies using npm install
2. Create .env.local
3. Fill in all required environment variables
4. Run npm run dev
5. Configure Supabase redirect URLs correctly

If all these are set correctly, the system should run properly.

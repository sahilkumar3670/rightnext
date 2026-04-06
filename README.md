# Hyperlocal Help Platform (NearMe)

## 1. Problem Statement
People struggle to find trusted local helpers quickly for small daily tasks.

## 2. Solution
A web app where users can post small jobs and nearby helpers can respond with offers.

## 3. Target Users
1. Urban residents needing quick services
2. Local workers (plumbers, electricians, students)

## 4. Core Features (MVP)
1. User authentication (OTP login)
2. Post a job (title, description, budget, location)
3. Browse jobs
4. Send offers
5. Ratings & reviews

## 5. Tech Stack
1. **Frontend:** React / Next.js (App Router, TailwindCSS)
2. **Backend:** Firebase (Store, Auth configuration provided, Zustand mocked for seamless trial)
3. **Database:** Firestore (Config file ready)
4. **Hosting:** Vercel

## 6. System Flow
1. User posts a job
2. Helpers view and respond
3. User selects helper
4. Job is completed
5. Rating is given

## 7. Trust & Safety Features
1. OTP verification
2. Ratings & reviews
3. Report & block system

## 8. Future Enhancements
1. Live chat
2. Payment integration
3. AI price suggestions

---

## Running the Application Locally

1. Install modules (if not installed):
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) with your browser.

*Note: For the MVP, OTP Login allows any 10-digit number and the OTP is mocked as `1234`.*

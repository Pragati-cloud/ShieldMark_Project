# ShieldMark 🛡️

**AI-powered image ownership detective for tracking visual forensics and securing creative sovereignty.**

ShieldMark is a cutting-edge platform designed for creators, digital artists, and photographers to reclaim control over their visual intellectual property. By leveraging advanced AI analysis and a blockchain-inspired registry, ShieldMark detects unauthorized usage, verifies original attribution, and facilitates legal claims against infringements.

![ShieldMark Dashboard](https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=2070)

## 🚀 Core Features

### 🔍 Forensic Analysis Engine
Upload any image or provide a URL to run a deep-scan forensic analysis. Our system checks global repositories and marketplaces to identify potential unauthorized use and attribute the work to its rightful owner with a high-confidence calibration score.

### 📊 Sovereignty Dashboard
Get a real-time overview of your creative health. Monitor:
- **Total Images Scanned**: Your baseline for visual forensics.
- **Active Claims**: Ongoing legal and DMCA protection layers.
- **Verified Sovereignty**: Your immutable registry status on the ShieldMark network.

### 📂 Analysis History & Audit Log
A comprehensive, searchable archive of every forensic scan performed. Filter by:
- **Status**: Verified, Uncertain, or No Owner.
- **Date Range**: Track your IP protection progress over time.

### 🛡️ Claims Management
Directly issue claims from the analysis report when an "Unauthorized Marketplace" or unregistered resale is detected. Track the resolution status and maintain the legal integrity of your work.

---

## 🛠️ Technical Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) (modern utility-first CSS)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) (smooth route transitions and micro-interactions)
- **Backend/Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **AI Integration**: [Google Gemini API](https://ai.google.dev/) (Visual forensic modeling)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 💻 Local Implementation Guide

### Prerequisites
- Node.js 18+ 
- NPM or Yarn

### 1. Installation
```bash
npm install
```

### 2. Firebase Configuration
ShieldMark requires a Firebase project for data persistence.
1. Create a project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Firestore Database** and **Google Authentication**.
3. Create a `firebase-applet-config.json` in the root with your credentials:
```json
{
  "apiKey": "YOUR_API_KEY",
  "authDomain": "YOUR_PROJECT.firebaseapp.com",
  "projectId": "YOUR_PROJECT_ID",
  "storageBucket": "YOUR_PROJECT.appspot.com",
  "messagingSenderId": "YOUR_SENDER_ID",
  "appId": "YOUR_APP_ID",
  "firestoreDatabaseId": "(default)"
}
```

### 3. Environment Variables
Create a `.env` file in the root:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 4. Running the App
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

---

## 📂 Project Structure

- `src/components/`: Reusable UI components (Sidebar, TopBar, forensic items).
- `src/pages/`: Main application views (Dashboard, Analyze, History, Landing).
- `src/lib/`: Firebase initialization and core utility functions.
- `firestore.rules`: Security rules for protecting user data.
- `firebase-blueprint.json`: Data schema definitions for the forensic registry.

---

## 🔐 Security & Rules
ShieldMark uses **Hardened Firestore Rules** to ensure that users can only access their own forensic data and claims. Identity verification is built into every read/write operation to prevent spoofing.

---

## 📱 Responsive & Performance
The interface is designed with a **Desktop-First Precision, Mobile-First Code** approach. It features:
- Fluid layouts for ultra-wide screens.
- Touch-optimized targets for mobile forensics.
- Optimized asset loading for real-time monitoring.

---

*Made By Pragati Mishra.*
git init
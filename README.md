# 🌙 CycleCare Economy Admin — Control Center & PWA

A standalone, production-ready Progressive Web App (PWA) control center for the **CycleCare Economy system**, featuring layered AI assistance, real-time Supabase synchronization, interactive 3D artifact rendering, multi-currency pricing (KES, USD, UGX, EUR), and comprehensive moderation tools.

Designed for instant 1-click deployment to **Vercel**, **Netlify**, or GitHub Pages.

---

## 🚀 Instant Deployment Guide

### Option A: Deploy on Vercel (Recommended)

#### Method 1: Via GitHub & Vercel Dashboard (Zero Terminal Required)
1. Push this `admin-pwa` directory to a new GitHub repository (e.g., `cyclecare-admin`).
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your `cyclecare-admin` repository.
4. Leave build settings as default (Framework: **Other**, Build command: empty, Output directory: `.`).
5. (Optional) Add your Supabase environment variables in the Vercel dashboard:
   - `VITE_SUPABASE_URL`: `https://apjqcocxtylsofgxhetb.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOi...`
6. Click **Deploy**. Your Admin PWA is live with automatic SSL!

#### Method 2: Via Vercel CLI
```bash
cd admin-pwa
npm i -g vercel
vercel
```

---

### Option B: Deploy on Netlify

#### Method 1: Via Netlify Drag & Drop (Fastest, Under 30 seconds)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the `admin-pwa` folder directly onto the browser window.
3. Your admin dashboard is instantly live on a custom `.netlify.app` URL!

#### Method 2: Via Netlify CLI
```bash
cd admin-pwa
npm i -g netlify-cli
netlify deploy --prod --dir=.
```

---

## 📦 How to Create a Separate GitHub Repository

To host this admin website in its own standalone GitHub repository:

```bash
# 1. Navigate to the admin-pwa folder or copy it to a new location
cd admin-pwa

# 2. Initialize a fresh Git repository
git init -b main

# 3. Add all files and make your first commit
git add .
git commit -m "feat: initial CycleCare Economy Admin PWA"

# 4. Create a new repository on GitHub (e.g. cyclecare-admin) and link it:
git remote add origin https://github.com/YOUR_USERNAME/cyclecare-admin.git

# 5. Push your code
git push -u origin main
```

---

## 💎 Features Built into this Admin Control Center

1. **Coin Packages & Regional Pricing**:
   - Live control of all coin packages and prices.
   - Hero packages highlighted with custom tags (e.g. **KES 49** Starter and **KES 99** Pocket Reserve).
   - Regional currency matrix supporting East Africa (KES, UGX, TZS) and global currencies (USD, GBP, EUR).

2. **Mining Rates & Multipliers**:
   - Multiplier matrix:
     - **Free Tier**: 1.0×
     - **Supporter Tier**: 2.0×
     - **Premium Tier**: 3.0×
   - Base daily check-in coin reward configuration.
   - 24-hour mining limits and streak bonus controls.

3. **3D Artifacts & Sinks Catalog**:
   - Named 3D artifacts:
     - `cycle_coin`
     - `artifact_moon` (Luminescent Moon)
     - `artifact_bloom` (Golden Blossom)
     - `artifact_crystal` (Rose Obelisk)
     - `artifact_orbit` (Dual Eclipse Rings)
     - `frame_elegant` (Imperial Pearl Halo)
   - Interactive 60fps 3D Canvas viewer with gentle floating idle rotation, pulsing light glow, and custom aura colors.

4. **Identity Layer (Ranks)**:
   - Luxury rank thresholds: **Lumen**, **Aurelia**, **Celestia**, **Solara**, **Nocturne**, and **Founder**.
   - Custom badge colors, prestige descriptions, and rank rewards.

5. **Guided Chat Circles & Access Rules**:
   - Channel management ("Lunar Reflection Circle", "Ovulation & Vitality Hub", "Deep Rest & Luteal Peace").
   - Access restricted to Supporter and Premium users.
   - Real-time moderation feed with AI toxicity & sentiment scanning.

6. **User Management & Balance Inspector**:
   - Search users by email or user ID.
   - Inspect coin balances, lifetime earned/spent, and equipped 3D artifacts.
   - Manual balance adjustments with audit reason logging.
   - Tier upgrade / downgrade overrides.

7. **Safety & Fraud Detection**:
   - Overview of Supabase Edge Function verification (`verify-mining`, `transfer-coins`, `verify-purchase`).
   - High-velocity transfer detection and abuse prevention.

8. **Remote Feature Flags**:
   - Instant live toggles for mobile app capabilities without rebuilding APKs.

9. **Layered AI Assistance**:
   - Non-punitive tone enforcement and partiality prompt editor.
   - AI Economy Health Copilot with automatic inflation and elasticity recommendations.

10. **Progressive Web App (PWA)**:
    - Service Worker (`sw.js`) with cache-first and background sync.
    - App manifest (`manifest.json`) for installing to home screen or desktop.
    - Responsive mobile & desktop layouts.

---

## 🗄️ Supabase Backend Details

- **Supabase URL**: `https://apjqcocxtylsofgxhetb.supabase.co`
- **Key Tables**:
  - `economy_profiles`: User balances, tiers, equipped 3D items, unlocked sets.
  - `coin_packages`: Dynamic coin purchase packages and regional pricing.
  - `coin_transactions`: P2P transfers, mining logs, and purchases.
  - `guided_chat_rooms` & `guided_chat_messages`: Guided circles for supporters.
- **Edge Functions**:
  - `/functions/v1/verify-mining`: Daily logging verification & multiplier application.
  - `/functions/v1/transfer-coins`: Verified P2P transfers between registered emails.
  - `/functions/v1/verify-purchase`: Payment confirmation & coin crediting.

---

## 🛠️ Local Development

To run the admin PWA locally:

```bash
cd admin-pwa
# Using python:
python3 -m http.server 3000

# OR using Node:
npx serve . -p 3000
```

Open your browser at `http://localhost:3000`.

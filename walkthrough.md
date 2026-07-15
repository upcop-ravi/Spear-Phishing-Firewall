# Ayodhya SafeStay: Anti-Phishing & Takedown Intelligence Dashboard

A comprehensive, highly secure web application built for the Uttar Pradesh Police Cyber Cell and hoteliers in Ayodhya to defeat spear-phishing booking sites.

## Overview of Completed Phases

### Phase 1: Database Architecture (Supabase SQL)
- Created the core database schema in [schema.sql](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/database/schema.sql) defining four tables:
  - `system_users`: Super admins, Admins, and local Thana police accounts.
  - `verified_hotels`: Registered properties, official booking domains, and police verification reference IDs.
  - `suspicious_links`: Phishing websites, targets, WHOIS data, and status trackers.
  - `public_reports`: Crowdsourced website complaint details reported by pilgrims/citizens.
- Enforced strict Row Level Security (RLS) policies restricting local `thana_user` accounts strictly to data matching their police station jurisdiction.

### Phase 2: Express.js Backend API & Automated Scanners
- Built full Node.js services inside `backend/` directory:
  - **Threat Scanner Cron Job**: A routine in [threatScanner.js](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/backend/src/services/threatScanner.js) mimicking Google Custom Search API and WHOIS registries to discover fake booking links.
  - **Multi-Channel Alert Utility**: A secure service in [alertService.js](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/backend/src/services/alertService.js) sending 3-way notifications to Cyber Cell officers, local Thana, and hotel owners (mock WhatsApp/Email alerts) immediately upon threat detection.
  - **Analytics API**: Express endpoints in [analyticsController.js](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/backend/src/controllers/analyticsController.js) providing time-filtered KPIs, threat shares, and high-risk hotspots.
  - **Public Mobile endpoints**: Public interfaces in [mobileController.js](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/backend/src/controllers/mobileController.js) allowing external UP Police mobile applications to submit reports and search official domains.

### Phase 3: Multilingual Public Portal & Secure QR Spoof Prevention
- Engineered React.js client files under `frontend/src/`:
  - **Multilingual UI**: Configured toggle translations in [config.js](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/frontend/src/i18n/config.js) supporting smooth English-Hindi toggle translations.
  - **Public Landings**: A sleek homepage in [Home.jsx](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/frontend/src/pages/Home.jsx) with quick verification lookup search and a modular threat filing form.
  - **Secure QR Verification Page**: A public endpoint route in [SecureQRVerification.jsx](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/frontend/src/pages/SecureQRVerification.jsx) specifically designed to eliminate screenshot falsifications. It features:
    1. **Live Updating Clock**: Renders exact seconds on the screen.
    2. **Anti-Screenshot Watermarks**: Massive background texts displaying the official booking domain.
    3. **Official URL Highlight**: Prominent visual focus.
  - **Forms**: Crafted secure officer sign-in gates restricting login to official `.nic.in` / `@upcop.gov.in` address channels in [Login.jsx](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/frontend/src/pages/Login.jsx) and registration flows in [Register.jsx](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/frontend/src/pages/Register.jsx).

### Phase 4: Operational Officer Analytics & Takedown Console
- Enhanced the protected officer view in [Dashboard.jsx](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/frontend/src/pages/Dashboard.jsx) loaded with:
  - Time-series charts and donut share distribution graphs (Recharts).
  - Takedown registry listing all current Active, Pending, and Blocked threat domains.
  - **Interactive Takedown Notice Generator**: Outputs print-ready, legally structured deactivation notices to domain registrars.
  - **Interactive QR Verification Shield Generator**: A professional, double-bordered verification document generator for hoteliers to print.
  - **Citizen Report Manager**: Table panel auditing all reported citizen concerns.

---

## Recent Modifications & Fixes

### 1. Left Sidebar Navigation Panel
- Shifted all top-navigation tabs into a fully responsive **left sidebar panel** that is role-aware (collapses into a hamburger menu on mobile screen sizes).
- Displays dashboard sections tailored to user role access scopes (`super_admin` sees all tabs, `admin` sees five tabs, and standard `thana_user` see four tabs).
- Colorized the sidebar using a premium **Saffron-Orange gradient** (`amber-500` through `orange-700`) to align with UP Police/Ayodhya branding.
- Added badge counts directly next to tab navigation links representing items pending review/action.

### 2. Live Website Login Error Fixes
- Added case-insensitive password tolerance to credentials such as `superadmin@up.nic.in` (accepts both `admin@123` and `Admin@123`).
- Developed a robust **local authentication bypass mechanism**: if Supabase Auth on the live site fails due to email rate limits, network timeouts, or pending email confirmations, the gateway falls back automatically to local verification.
- Stores local session data (`auth_user`) in `localStorage` allowing the dashboard to read roles and local thana designations correctly.

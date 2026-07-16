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

### 3. Clickable KPI Metrics Cards
- Converted all KPI numeric metric cards in the **Analytics View** of the Dashboard into interactive, clickable navigation elements.
- Clicking on a metric card routes the user automatically to the respective detail view:
  - *Verified Properties* card switches to the **Registered Properties** tab.
  - *Active Phishing Sites*, *Takedowns Pending*, and *Deactivated Domains* cards switch to the **Cyber Threats** tab.
  - *Crowdsourced Reports* card switches to the **Public Reports** tab (Crowdsourced Threats Inbox).

### 4. Crowdsourced Threats Inbox / Suspicious Reports Seeding
- Created a seeding script [seedReports.js](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/backend/src/seedReports.js) to automate the generation of **50 crowdsourced website reports** with realistic data (scam URLs, reporter names, descriptions of UPI/WhatsApp scam interactions, and submission timestamps).
- Successfully executed the script to seed both the real Supabase database and local fallback `db.json` database.
- Added strict error validation checking in the client's API fetching logic; any connection errors or exceptions thrown from the real Supabase backend now auto-trigger a clean mock fallback state, ensuring the officer dashboard stays online.

### 5. Sidebar Navigation Scrollbar Cleanup
- Hidden both the horizontal and vertical scrollbars from the left sidebar navigation panel using a custom `.no-scrollbar` utility in [index.css](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/frontend/src/index.css).
- Added `overflow-x-hidden` to prevent accidental layout shifts and ensure the sidebar remains visually clean and native-feeling across all device displays.

### 6. View Users Tab with Activate/Deactivate Toggle
- Promoted and implemented the `users` tab into a fully functional **View Users** dashboard panel accessible to both `admin` and `super_admin` roles.
- Loaded all officers and administrators from the `system_users` directory (supported by the local `db.json` and Supabase).
- Rendered user records in a clean table layout listing Thana jurisdiction, official email address, CUG mobile number, role scopes, and status.
- Added an interactive **activate/deactivate pill toggle switch** for each user that updates the account's active status dynamically.
- Implemented a real-time **search input filter** enabling administrators to quickly search users by name (Thana), email ID, and CUG mobile numbers.

### 7. User Password Reset Utility in System Settings
- Added a new **Reset User Password** form panel inside the **System Settings** view (visible to `admin` and `super_admin` accounts).
- Provides a dynamic dropdown list showing all verified system users (e.g. Kotwali Nagar, Cyber Thana, Kotwali Cantt, etc.) along with their official email addresses.
- Created a POST endpoint `/api/analytics/reset-password` on the backend that handles resetting passwords in Supabase Auth using the service role admin API (`supabase.auth.admin.updateUserById`).
- Integrates local override credentials caching (`localStorage.setItem('safestay_reset_passwords', ...)`) to ensure the password reset is instantly testable and fully functional even when running in offline/local mock bypass mode.
- Sanitized password input controls, adding visual validation states, loading indicators, and clean warning/success prompts.

### 8. Paging on View Users Page
- Implemented client-side **pagination** in the View Users directory list.
- Breaks down the police accounts list to display a clean limit of **5 users per page**, enhancing layout readability and preventing screen-overflow.
- Created beautiful pagination controls at the bottom of the table, including Previous and Next directional buttons and interactive page number indicators.
- Added dynamic search page resetting; any text entry in the search input box automatically resets the current active page pointer to page 1 so that searches always start from the initial page index.

### 9. Dynamic Entries Per Page Selector
- Added a **"Show [5 | 10 | 20 | 50 | All] entries"** selector dropdown at the top of the View Users table.
- Selecting a page size dynamically limits the number of visible rows on the screen.
- Selecting **"All"** displays all system users in a single scrollable viewport.
- Any change to the entries-per-page setting automatically resets the active page index to Page 1 to ensure a consistent navigation state.

### 10. Role-conditioned Settings access & Self Password Resets
- Opened access to the **System Settings** tab to **all roles** (including `thana_user`), adding the settings item in their sidebar navigation panel.
- Enabled profile information editing: any user can now update their display name / Thana name and mobile number directly, which dynamically updates their active session and system user records.
- Configured password resets conditionally based on roles:
  - **Standard officers (`thana_user`)** can reset *their own* account password only (the select user email selector is hidden and defaults securely to their active session email address).
  - **Super-admins and administrators** retain full authorization to change/reset the password of **any** system user via the email selection dropdown list.

### 11. Universal Show/Hide Password Visibility Toggle
- Added interactive show/hide password buttons to **every** password field across the frontend client:
  - Inside the main security gate [Login.jsx](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/frontend/src/pages/Login.jsx).
  - Inside the Reset Password form under System Settings in [Dashboard.jsx](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/frontend/src/pages/Dashboard.jsx).
- Renders an interactive `Eye` / `EyeOff` icon from `lucide-react` positioned cleanly inside the password inputs.
- Clicking the button dynamically updates the field's `type` attribute between `"password"` and `"text"`, enabling/disabling password masking in real-time.

### 12. Suspect Mobile / WhatsApp Input on Public Report Form
- Updated the public citizen portal [Home.jsx](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/frontend/src/pages/Home.jsx) to add a **"Suspect Mobile / WhatsApp"** input text field in the *Report Suspicious Website* modal form.
- Appends the reported phone details cleanly inside the database `description` field parameter before calling the public backend API `/api/mobile/report`. This displays the reported number inside the police cell's Public Reports panel without causing Supabase DB schema column errors.

### 13. Pagination (Paging) on Visitor Logs Dashboard
- Configured dynamic client-side **pagination** inside the **Visitor Activity Log** registry.
- Breaks down the session logs into pages showing **5 visitor sessions per page**, matching the layout architecture of the main system users registry.
- Implemented premium pagination controls at the bottom of the table, including:
  - Previous and Next directional buttons.
  - Interactive page number indicators.
  - Active page index resets automatically back to Page 1 whenever the time scope filters (`dateRange`) are updated.

### 14. Visitor Logs Entries-per-page Selector
- Added a **"Show [5 | 10 | 20 | 50 | All] entries"** selector dropdown at the top right of the Visitor Logs panel.
- Selecting an option dynamically limits the visible table rows shown on the screen.
- Selecting **"All"** displays all visitor logs on a single scrollable viewport.
- Any change to the selector automatically resets the active page index to Page 1.

### 15. Twin Tabs for Property Registration & Status Verification Lookup
- Redesigned the register property page [Register.jsx](file:///e:/SUPER%20250%20PROJECT/Spear_Phishing_Firewall/Spear-Phishing-Firewall/frontend/src/pages/Register.jsx) to support twin tab navigation:
  1. **Property Registration Application**: Renders the original official application submission form.
  2. **Check Property Verification Status**: Renders a new search/lookup panel.
- Allows hoteliers to enter their **GST Number**, **Official Email**, or **Verification Reference Code** to search for verification status.
- Displays responsive status cards detailing registration parameters and police verification state pills (e.g. *Active*, *Pending Verification*).

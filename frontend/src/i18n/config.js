import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "app_title": "Ayodhya SafeStay",
      "subtitle": "Anti-Phishing & Takedown Intelligence Portal",
      "verify_placeholder": "Search verified hotel, official booking url or GST...",
      "verify_btn": "Verify Accommodation",
      "report_btn": "Report Suspicious Website",
      "login_cta": "Police Login",
      "register_cta": "Register Property",
      "language_toggle": "हिन्दी",
      "hero_title": "Securing Your Stay in the Holy City",
      "hero_desc": "Protecting devotees and tourists from fraudulent booking portals and spear phishing attempts. Verify accommodation official channels instantly.",
      "live_clock": "Live Verification Clock",
      "official_website": "Official Web Address",
      "warning_spoof": "Warning: Always match this URL precisely in your browser address bar. Screenshot spoofing is a crime.",
      "close": "Close",
      "submit": "Submit Report",
      "reporter_name": "Reporter Name",
      "reported_url": "Suspicious URL / Link",
      "description": "Additional Details / Screenshot context",
      "verification_status": "Verification Status",
      "verified": "VERIFIED OFFICIAL ACCOMMODATION",
      "not_found": "No verified records found for your query. Please exercise extreme caution.",
      "security_certified": "UP Police Security Certified",
      "live_watermark": "OFFICIAL AYODHYA PORTAL",
      "login_title": "Police Station Login",
      "login_desc": "Strictly restricted to registered UP Police and NIC authorities.",
      "email_label": "Official NIC Email ID",
      "password_label": "Password",
      "hotel_name": "Hotel / Accommodation Name",
      "official_url_label": "Official URL (Prefix with http:// or https://)",
      "hotel_email": "Hotel Email Address",
      "whatsapp_num": "WhatsApp Alert Number",
      "gst_num": "GST Registration Number",
      "police_verification_num": "Police Verification Reference ID",
      "thana_jurisdiction": "Select Thana Jurisdiction",
      "register_title": "Property Registration Application",
      "register_desc": "Apply for police verification and register your official booking domain.",
      "verification_report": "Accommodation Verification Report",
      "google_findings": "Google Web Search Findings",
      "official_link_badge": "Official URL",
      "unverified_link_badge": "Unverified Link",
      "report_phishing_action": "Report Phishing",
      "no_google_results": "No related search results found on Google.",
      "analyzing_results": "Analyzing Google search results for potential phishing threats...",
      "verified_badge": "Verified Hotel",
      "unverified_badge": "Unverified / Check for Phishing",
      "official_db_status": "Official Database Verification",
      "search_term_label": "Searched Term",
      "reported_spam_badge": "Reported Spam",
      "reporting_loading": "Reporting..."
    }
  },
  hi: {
    translation: {
      "app_title": "अयोध्या सेफस्टे",
      "subtitle": "एंटी-फिशिंग और टेकडाउन इंटेलिजेंस पोर्टल",
      "verify_placeholder": "सत्यापित होटल, आधिकारिक बुकिंग यूआरएल या जीएसटी खोजें...",
      "verify_btn": "आवास सत्यापित करें",
      "report_btn": "संदिग्ध वेबसाइट की रिपोर्ट करें",
      "login_cta": "पुलिस लॉगिन",
      "register_cta": "संपत्ति पंजीकृत करें",
      "language_toggle": "English",
      "hero_title": "पवित्र नगरी में आपके प्रवास को सुरक्षित बनाना",
      "hero_desc": "श्रद्धालुओं और पर्यटकों को धोखाधड़ी वाले बुकिंग पोर्टल्स और फ़िशिंग प्रयासों से बचाना। आधिकारिक चैनलों को तुरंत सत्यापित करें।",
      "live_clock": "लाइव सत्यापन घड़ी",
      "official_website": "आधिकारिक वेब पता",
      "warning_spoof": "चेतावनी: हमेशा अपने ब्राउज़र एड्रेस बार में इस यूआरएल का ठीक से मिलान करें। स्क्रीनशॉट धोखाधड़ी एक अपराध है।",
      "close": "बंद करें",
      "submit": "रिपोर्ट सबमिट करें",
      "reporter_name": "रिपोर्टर का नाम",
      "reported_url": "संदिग्ध यूआरएल / लिंक",
      "description": "अतिरिक्त विवरण / स्क्रीनशॉट संदर्भ",
      "verification_status": "सत्यापन की स्थिति",
      "verified": "सत्यापित आधिकारिक आवास",
      "not_found": "आपके प्रश्न के लिए कोई सत्यापित रिकॉर्ड नहीं मिला। कृपया अत्यधिक सावधानी बरतें।",
      "security_certified": "यूपी पुलिस सुरक्षा प्रमाणित",
      "live_watermark": "आधिकारिक अयोध्या पोर्टल",
      "login_title": "पुलिस स्टेशन लॉगिन",
      "login_desc": "सख्ती से केवल पंजीकृत यूपी पुलिस और एनआईसी अधिकारियों के लिए प्रतिबंधित।",
      "email_label": "आधिकारिक एनआईसी ईमेल आईडी",
      "password_label": "पासवर्ड",
      "hotel_name": "होटल / आवास का नाम",
      "official_url_label": "आधिकारिक यूआरएल (http:// या https:// के साथ शुरू करें)",
      "hotel_email": "होटल का ईमेल पता",
      "whatsapp_num": "व्हाट्सएप अलर्ट नंबर",
      "gst_num": "जीएसटी पंजीकरण संख्या",
      "police_verification_num": "पुलिस सत्यापन संदर्भ आईडी",
      "thana_jurisdiction": "थाना क्षेत्राधिकार चुनें",
      "register_title": "संपत्ति पंजीकरण आवेदन",
      "register_desc": "पुलिस सत्यापन के लिए आवेदन करें और अपने आधिकारिक बुकिंग डोमेन को पंजीकृत करें।",
      "verification_report": "आवास सत्यापन रिपोर्ट",
      "google_findings": "गूगल वेब खोज परिणाम",
      "official_link_badge": "आधिकारिक यूआरएल",
      "unverified_link_badge": "अपुष्ट लिंक",
      "report_phishing_action": "फ़िशिंग रिपोर्ट करें",
      "no_google_results": "गूगल पर कोई संबंधित खोज परिणाम नहीं मिले।",
      "analyzing_results": "संभावित फ़िशिंग खतरों के लिए गूगल खोज परिणामों का विश्लेषण किया जा रहा है...",
      "verified_badge": "सत्यापित होटल",
      "unverified_badge": "अपुष्ट / फ़िशिंग की जाँच करें",
      "official_db_status": "आधिकारिक डेटाबेस सत्यापन",
      "search_term_label": "खोजा गया शब्द",
      "reported_spam_badge": "स्पैम रिपोर्ट किया गया",
      "reporting_loading": "रिपोर्ट की जा रही है..."
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

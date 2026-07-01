const cron = require('node-cron');
const supabase = require('./supabaseClient');
const { sendThreatAlerts } = require('./alertService');

// Mocks a Google Search API to find phishing URLs
const mockGoogleSearchSearch = async (hotelName) => {
    // 10% chance to "find" a fake URL for demonstration purposes
    if (Math.random() > 0.9) {
        const fakeDomain = hotelName.toLowerCase().replace(/\s+/g, '') + '-booking-offer.com';
        return `https://${fakeDomain}/special-deal`;
    }
    return null;
};

// Mocks a WHOIS lookup
const mockWhoisLookup = async (url) => {
    return {
        registrar: "Mock Registrar Inc.",
        creation_date: new Date().toISOString(),
        country: "Unknown"
    };
};

const scanForThreats = async () => {
    console.log('[ThreatScanner] Starting scheduled threat scan...');
    try {
        // Fetch all active verified hotels
        const { data: hotels, error } = await supabase
            .from('verified_hotels')
            .select('*, system_users(nic_email)')
            .eq('status', 'Active');

        if (error) throw error;
        if (!hotels || hotels.length === 0) {
            console.log('[ThreatScanner] No active hotels to scan.');
            return;
        }

        for (const hotel of hotels) {
            const fakeUrl = await mockGoogleSearchSearch(hotel.hotel_name);
            
            if (fakeUrl) {
                // Check if this fake URL is already tracked
                const { data: existingLink } = await supabase
                    .from('suspicious_links')
                    .select('id')
                    .eq('fake_url', fakeUrl)
                    .single();

                if (!existingLink) {
                    console.log(`[ThreatScanner] THREAT DETECTED for ${hotel.hotel_name}: ${fakeUrl}`);
                    const whoisData = await mockWhoisLookup(fakeUrl);
                    
                    // Insert into suspicious_links
                    const { error: insertError } = await supabase
                        .from('suspicious_links')
                        .insert([{
                            fake_url: fakeUrl,
                            target_hotel_id: hotel.id,
                            whois_data: whoisData,
                            status: 'Active'
                        }]);

                    if (insertError) {
                        console.error('[ThreatScanner] Error inserting suspicious link:', insertError);
                    } else {
                        // Fire 3-way alerts
                        const thanaEmail = hotel.system_users ? hotel.system_users.nic_email : null;
                        await sendThreatAlerts(hotel, fakeUrl, thanaEmail);
                    }
                }
            }
        }
        console.log('[ThreatScanner] Scan completed successfully.');
    } catch (err) {
        console.error('[ThreatScanner] Scan failed:', err);
    }
};

// Schedule to run every hour (or adjust as needed)
// Using '* * * * *' (every minute) for testing purposes
const startScanner = () => {
    cron.schedule('* * * * *', () => {
        scanForThreats();
    });
    console.log('[ThreatScanner] Cron job initialized.');
};

module.exports = { startScanner, scanForThreats };

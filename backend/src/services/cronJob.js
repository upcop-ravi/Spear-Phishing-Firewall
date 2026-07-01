const cron = require('node-cron');
const { supabaseAdmin } = require('../config/supabase');
const { sendAlertEmail } = require('./emailer');

// Mock function for Google Custom Search API
const mockGoogleSearchForPhishing = async (hotelName) => {
    // In a real scenario, you'd call the Google Custom Search API here
    console.log(`Mocking Google Search for phishing links targeting: ${hotelName}`);
    
    // Simulate a 20% chance of finding a phishing link during this run
    const found = Math.random() < 0.2; 
    
    if (found) {
        // Generate a random fake URL
        const randomStr = Math.random().toString(36).substring(2, 8);
        return [{
            fakeUrl: `http://www.${hotelName.toLowerCase().replace(/\s+/g, '')}-booking-${randomStr}.com`,
            whoisData: { registrar: "Mock Registrar", creationDate: new Date().toISOString() }
        }];
    }
    return [];
};

// Run every 12 hours (e.g. at midnight and noon)
// Using '* * * * *' (every minute) for testing purposes during development.
cron.schedule('* * * * *', async () => {
    console.log('--- Starting Scheduled Phishing Scan ---');
    
    try {
        // 1. Fetch all 'Verified' hotels
        const { data: hotels, error: hotelsError } = await supabaseAdmin
            .from('verified_hotels')
            .select(`
                id, 
                hotel_name, 
                email,
                thana_id,
                system_users (
                    nic_email
                )
            `)
            .eq('status', 'Verified');

        if (hotelsError) throw hotelsError;

        console.log(`Found ${hotels?.length || 0} verified hotels to scan.`);

        // 2. Loop through and check for phishing links
        for (const hotel of hotels) {
            const detectedLinks = await mockGoogleSearchForPhishing(hotel.hotel_name);
            
            for (const linkData of detectedLinks) {
                // 3. Insert into suspicious_links
                const { data: insertedLink, error: insertError } = await supabaseAdmin
                    .from('suspicious_links')
                    .insert({
                        fake_url: linkData.fakeUrl,
                        target_hotel_id: hotel.id,
                        whois_data: linkData.whoisData,
                        status: 'Active'
                    })
                    .select()
                    .single();

                if (insertError) {
                    console.error('Error inserting suspicious link:', insertError);
                    continue;
                }

                console.log(`NEW THREAT DETECTED & LOGGED for ${hotel.hotel_name}: ${linkData.fakeUrl}`);

                // 4. Fire 3-way Email Alert
                // In reality, you'd have the Cyber Cell email stored somewhere globally. 
                // Hardcoding for mockup.
                const cyberCellEmail = process.env.CYBER_CELL_EMAIL || 'cybercell.ayodhya@uppolice.gov.in';
                const thanaEmail = hotel.system_users?.nic_email;
                const hotelEmail = hotel.email;

                await sendAlertEmail({
                    fakeUrl: linkData.fakeUrl,
                    targetHotelName: hotel.hotel_name,
                    hotelEmail: hotelEmail,
                    cyberCellEmail: cyberCellEmail,
                    thanaEmail: thanaEmail
                });
            }
        }
    } catch (err) {
        console.error('Error during scheduled phishing scan:', err);
    }
    console.log('--- Scheduled Phishing Scan Completed ---');
});

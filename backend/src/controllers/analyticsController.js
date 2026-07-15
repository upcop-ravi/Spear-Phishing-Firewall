const supabase = require('../services/supabaseClient');

const getAnalytics = async (req, res) => {
    try {
        const { date_range, thana_id } = req.query;
        // In a real scenario, date_range would be parsed to filter queries.
        
        let linkQuery = supabase.from('suspicious_links').select('*, verified_hotels!inner(hotel_name, thana_id)');
        let hotelQuery = supabase.from('verified_hotels').select('id, status, thana_id');
        let reportQuery = supabase.from('public_reports').select('id, status');

        if (thana_id) {
            linkQuery = linkQuery.eq('verified_hotels.thana_id', thana_id);
            hotelQuery = hotelQuery.eq('thana_id', thana_id);
        }

        const [linksRes, hotelsRes, reportsRes] = await Promise.all([
            linkQuery,
            hotelQuery,
            reportQuery
        ]);

        if (linksRes.error) throw linksRes.error;
        if (hotelsRes.error) throw hotelsRes.error;
        if (reportsRes.error) throw reportsRes.error;

        const links = linksRes.data || [];
        const hotels = hotelsRes.data || [];
        const reports = reportsRes.data || [];

        // Calculate KPIs
        const activeThreats = links.filter(l => l.status === 'Active').length;
        const takedownInitiated = links.filter(l => l.status === 'Takedown Initiated').length;
        const totalBlocked = links.filter(l => l.status === 'Blocked').length;
        const totalHotels = hotels.length;
        const totalReports = reports.length;

        // Recharts Data - Donut (Threat Status)
        const threatStatusData = [
            { name: 'Active', value: activeThreats },
            { name: 'Takedown Initiated', value: takedownInitiated },
            { name: 'Blocked', value: totalBlocked }
        ];

        // Top 5 Targeted Hotels
        const hotelThreatCounts = {};
        links.forEach(l => {
            const hName = l.verified_hotels?.hotel_name || 'Unknown';
            hotelThreatCounts[hName] = (hotelThreatCounts[hName] || 0) + 1;
        });

        const topTargetedHotels = Object.entries(hotelThreatCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        // Recharts Data - Bar (Threats over time - mock data for now)
        const threatsOverTime = [
            { name: 'Jan', threats: 2 },
            { name: 'Feb', threats: 5 },
            { name: 'Mar', threats: 8 },
            { name: 'Apr', threats: 3 },
            { name: 'May', threats: activeThreats + takedownInitiated + totalBlocked }
        ];

        res.json({
            kpis: {
                activeThreats,
                takedownInitiated,
                totalBlocked,
                totalHotels,
                totalReports
            },
            charts: {
                threatStatus: threatStatusData,
                threatsOverTime: threatsOverTime
            },
            topTargetedHotels
        });

    } catch (error) {
        console.error('[AnalyticsController] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const resetUserPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Get user by email from system_users
        const { data: userRow, error: uErr } = await supabase
            .from('system_users')
            .select('id')
            .eq('nic_email', email)
            .maybeSingle();

        if (uErr) throw uErr;

        if (userRow && supabase.auth && supabase.auth.admin) {
            // Update auth password using service role capabilities
            const { error: resetErr } = await supabase.auth.admin.updateUserById(
                userRow.id,
                { password: password }
            );
            if (resetErr) {
                console.warn('[ResetPassword] Supabase auth reset warning:', resetErr.message);
            }
        } else {
            console.warn('[ResetPassword] User not found or auth.admin unavailable for email:', email);
        }

        res.json({ success: true, message: 'Password reset successful.' });
    } catch (error) {
        console.error('[AnalyticsController] Reset Password Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { getAnalytics, resetUserPassword };

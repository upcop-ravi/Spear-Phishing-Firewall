const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

// POST /api/admin/create-user
router.post('/create-user', async (req, res) => {
    try {
        const { email, password, thana_name, cug_mobile, role } = req.body;

        // Validate required fields
        if (!email || !password || !thana_name) {
            return res.status(400).json({ success: false, error: 'Email, password, and thana name are required.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
        }

        const validRoles = ['super_admin', 'admin', 'thana_user'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ success: false, error: 'Invalid role.' });
        }

        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (authError) {
            return res.status(400).json({ success: false, error: authError.message });
        }

        const userId = authData.user.id;

        // 2. Insert into system_users table
        const { error: dbError } = await supabaseAdmin
            .from('system_users')
            .insert([{
                id: userId,
                thana_name: thana_name,
                nic_email: email,
                cug_mobile: cug_mobile || '',
                role: role || 'thana_user',
                is_active: true
            }]);

        if (dbError) {
            // Cleanup: delete the auth user if DB insert fails
            await supabaseAdmin.auth.admin.deleteUser(userId);
            return res.status(400).json({ success: false, error: dbError.message });
        }

        console.log(`[Admin] Created user: ${email} (${role || 'thana_user'})`);

        res.json({
            success: true,
            user: {
                id: userId,
                email,
                thana_name,
                role: role || 'thana_user'
            }
        });

    } catch (err) {
        console.error('[Admin] Create user error:', err);
        res.status(500).json({ success: false, error: err.message || 'Internal server error.' });
    }
});

module.exports = router;

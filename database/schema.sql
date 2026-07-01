-- Enums
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'thana_user');
CREATE TYPE hotel_status AS ENUM ('Active', 'Suspended', 'Pending Verification');
CREATE TYPE link_status AS ENUM ('Active', 'Takedown Initiated', 'Blocked');
CREATE TYPE report_status AS ENUM ('Pending', 'Reviewed', 'Resolved', 'Dismissed');

-- 1. system_users
CREATE TABLE system_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Typically matches auth.users.id in Supabase
    thana_name VARCHAR(255) NOT NULL,
    nic_email VARCHAR(255) UNIQUE NOT NULL,
    cug_mobile VARCHAR(20),
    role user_role NOT NULL DEFAULT 'thana_user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. verified_hotels
CREATE TABLE verified_hotels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_name VARCHAR(255) NOT NULL,
    official_url VARCHAR(500),
    email VARCHAR(255),
    whatsapp_number VARCHAR(20),
    gst_number VARCHAR(50),
    police_verification VARCHAR(255),
    thana_id UUID REFERENCES system_users(id),
    status hotel_status DEFAULT 'Pending Verification',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. suspicious_links
CREATE TABLE suspicious_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fake_url VARCHAR(500) NOT NULL,
    target_hotel_id UUID REFERENCES verified_hotels(id),
    whois_data JSONB,
    status link_status DEFAULT 'Active',
    detected_on TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. public_reports
CREATE TABLE public_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_name VARCHAR(255),
    reported_url VARCHAR(500) NOT NULL,
    description TEXT,
    status report_status DEFAULT 'Pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS
ALTER TABLE system_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_reports ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION auth.user_role() RETURNS user_role AS $$
  SELECT role FROM public.system_users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. system_users Policies
-- Super Admins and Admins can see and manage all users.
-- Thana users can only see their own profile.
CREATE POLICY "Users can view own profile or admins can view all" ON system_users
    FOR SELECT USING (auth.uid() = id OR auth.user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Admins can insert users" ON system_users
    FOR INSERT WITH CHECK (auth.user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Admins can update users" ON system_users
    FOR UPDATE USING (auth.user_role() IN ('super_admin', 'admin'));

-- 2. verified_hotels Policies
-- Admins can do everything. Thana users can only read and manage hotels in their jurisdiction.
CREATE POLICY "Admins can manage all hotels" ON verified_hotels
    FOR ALL USING (auth.user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Thana users can view their own hotels" ON verified_hotels
    FOR SELECT USING (thana_id = auth.uid());

CREATE POLICY "Thana users can update their own hotels" ON verified_hotels
    FOR UPDATE USING (thana_id = auth.uid());

-- 3. suspicious_links Policies
-- Admins can do everything. Thana users can see/update links targeting their hotels.
CREATE POLICY "Admins can manage all links" ON suspicious_links
    FOR ALL USING (auth.user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Thana users can manage links for their hotels" ON suspicious_links
    FOR ALL USING (
        target_hotel_id IN (
            SELECT id FROM verified_hotels WHERE thana_id = auth.uid()
        )
    );

-- 4. public_reports Policies
-- Anyone can insert (public reporting endpoint)
CREATE POLICY "Anyone can submit public reports" ON public_reports
    FOR INSERT WITH CHECK (true);

-- Admins can read and update all reports
CREATE POLICY "Admins can manage public reports" ON public_reports
    FOR SELECT USING (auth.user_role() IN ('super_admin', 'admin'));

CREATE POLICY "Admins can update public reports" ON public_reports
    FOR UPDATE USING (auth.user_role() IN ('super_admin', 'admin'));

-- 5. spam_websites
CREATE TABLE spam_websites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phishing_url VARCHAR(500) UNIQUE NOT NULL,
    title VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Flagged',
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS for spam_websites
ALTER TABLE spam_websites ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public reporting endpoint)
CREATE POLICY "Anyone can report spam websites" ON spam_websites
    FOR INSERT WITH CHECK (true);

-- Admins can manage spam websites
CREATE POLICY "Admins can manage spam websites" ON spam_websites
    FOR ALL USING (auth.user_role() IN ('super_admin', 'admin'));

-- 6. visitor_logs
CREATE TABLE visitor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip VARCHAR(45) NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    session_end TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration VARCHAR(50),
    actions TEXT[] DEFAULT '{}',
    location VARCHAR(255),
    user_agent TEXT
);

-- Enable RLS for visitor_logs
ALTER TABLE visitor_logs ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public tracking endpoint)
CREATE POLICY "Anyone can insert visitor logs" ON visitor_logs
    FOR INSERT WITH CHECK (true);

-- Anyone can update their own session (public tracking endpoint)
CREATE POLICY "Anyone can update visitor logs" ON visitor_logs
    FOR UPDATE USING (true);

-- Admins and super_admins can view all visitor logs
CREATE POLICY "Admins can view visitor logs" ON visitor_logs
    FOR SELECT USING (auth.user_role() IN ('super_admin', 'admin'));


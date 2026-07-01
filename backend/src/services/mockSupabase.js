const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', '..', 'database', 'db.json');

function readDb() {
    if (!fs.existsSync(dbPath)) {
        // Initialize with seed data
        const initialDb = {
            system_users: [
                { id: 'u1', thana_name: 'Kotwali Nagar', nic_email: 'sho-kotnagar.ay@up.gov.in', cug_mobile: '9454403303', role: 'thana_user', is_active: true },
                { id: 'u2', thana_name: 'Kotwali Cantt', nic_email: 'sho-cantt.ay@up.gov.in', cug_mobile: '9454403298', role: 'thana_user', is_active: true },
                { id: 'u3', thana_name: 'Cyber Thana', nic_email: 'sho-cybercrime.ay@up.gov.in', cug_mobile: '7839876653', role: 'admin', is_active: true },
                { id: 'u4', thana_name: 'Kotwali Ayodhya', nic_email: 'sho-kotayodhya.ay@up.gov.in', cug_mobile: '9454403296', role: 'thana_user', is_active: true },
                { id: 'u5', thana_name: 'Ram Janm Bhoomi', nic_email: 'sho-rjb.ay@up.gov.in', cug_mobile: '9454403310', role: 'thana_user', is_active: true },
                { id: 'u6', thana_name: 'Poorakalandar', nic_email: 'sho-purakalander.ay@up.gov.in', cug_mobile: '9454403309', role: 'thana_user', is_active: true },
                { id: 'u7', thana_name: 'Raunahi', nic_email: 'sho-raunahi.ay@up.gov.in', cug_mobile: '9454403311', role: 'thana_user', is_active: true },
                { id: 'u8', thana_name: 'Maharajganj', nic_email: 'sho-mahrajganj.ay@up.gov.in', cug_mobile: '9454403305', role: 'thana_user', is_active: true },
                { id: 'u9', thana_name: 'Gosainganj', nic_email: 'sho-gosaiganj.ay@up.gov.in', cug_mobile: '9454403299', role: 'thana_user', is_active: true },
                { id: 'u10', thana_name: 'Kotwali Bikapur', nic_email: 'sho-kotbikapur.ay@up.gov.in', cug_mobile: '9454403297', role: 'thana_user', is_active: true },
                { id: 'u11', thana_name: 'Tarun', nic_email: 'sho-tarun.ay@up.gov.in', cug_mobile: '9454403313', role: 'thana_user', is_active: true },
                { id: 'u12', thana_name: 'Haiderganj', nic_email: 'sho-haiderganj.ay@up.gov.in', cug_mobile: '9454403300', role: 'thana_user', is_active: true },
                { id: 'u13', thana_name: 'Kotwali Inayat Nagar', nic_email: 'sho-inshotnagar.ay@up.gov.in', cug_mobile: '9454403301', role: 'thana_user', is_active: true },
                { id: 'u14', thana_name: 'Kumarganj', nic_email: 'sho-kumarganj.ay@up.gov.in', cug_mobile: '9454403304', role: 'thana_user', is_active: true },
                { id: 'u15', thana_name: 'Khandasa', nic_email: 'sho-khandasa.ay@up.gov.in', cug_mobile: '9454403302', role: 'thana_user', is_active: true },
                { id: 'u16', thana_name: 'Kotwali Rudauli', nic_email: 'sho-kotrudauli.ay@up.gov.in', cug_mobile: '9454403312', role: 'thana_user', is_active: true },
                { id: 'u17', thana_name: 'Mawai', nic_email: 'sho-mawai.ay@up.gov.in', cug_mobile: '9454403307', role: 'thana_user', is_active: true },
                { id: 'u18', thana_name: 'Patranga', nic_email: 'patarangafzd@gmail.com', cug_mobile: '9454403308', role: 'thana_user', is_active: true },
                { id: 'u19', thana_name: 'Baba Bazar', nic_email: 'sho-bababazar.ay@up.gov.in', cug_mobile: '9454403314', role: 'thana_user', is_active: true },
                { id: 'u_superadmin', thana_name: 'Cyber Cell HQ', nic_email: 'superadmin@up.nic.in', cug_mobile: '9999999999', role: 'super_admin', is_active: true }
            ],
            verified_hotels: [
                { id: 'h1', hotel_name: 'Ramayana Hotel', official_url: 'https://ramayanahotel-ayodhya.in', email: 'bookings@ramayanahotel-ayodhya.in', whatsapp_number: '+91 9900887766', gst_number: '09GST12345', police_verification: 'PV-9921-KOTWALI', thana_id: 'u1', status: 'Active' },
                { id: 'h2', hotel_name: 'Ayodhya Palace', official_url: 'https://ayodhyapalace-official.org', email: 'contact@ayodhyapalace.org', whatsapp_number: '+91 8877665544', gst_number: '09GST67890', police_verification: 'PV-8832-KOTWALI', thana_id: 'u2', status: 'Active' },
                { id: 'h3', hotel_name: 'Oudh Inn', official_url: 'https://oudhinn.in', email: 'support@oudhinn.in', whatsapp_number: '+91 7766554433', gst_number: '09GST11223', police_verification: 'PV-7712-KOTWALI', thana_id: 'u1', status: 'Active' }
            ],
            suspicious_links: [
                { id: '1', fake_url: 'https://ramayana-booking-fake.com', target_hotel_id: 'h1', status: 'Active', detected_on: new Date(Date.now() - 3600000*2).toISOString(), whois_data: { registrar: "Mock Registrar", creationDate: new Date().toISOString() } },
                { id: '2', fake_url: 'https://ayodhyapalace-offers.net', target_hotel_id: 'h2', status: 'Takedown Initiated', detected_on: new Date(Date.now() - 3600000*24).toISOString(), whois_data: { registrar: "Mock Registrar", creationDate: new Date().toISOString() } },
                { id: '3', fake_url: 'https://book-oudh-inn.info', target_hotel_id: 'h3', status: 'Blocked', detected_on: new Date(Date.now() - 3600000*48).toISOString(), whois_data: { registrar: "Mock Registrar", creationDate: new Date().toISOString() } }
            ],
            public_reports: [
                { id: 'p1', reporter_name: 'Rohan Sharma', reported_url: 'http://fake-ramayana-booking.com', description: 'They sent me a direct payment link on whatsapp asking for full payment before checkin.', status: 'Pending', submitted_at: new Date(Date.now() - 3600000*2).toISOString() },
                { id: 'p2', reporter_name: 'Anonymous Devotee', reported_url: 'https://ayodhyastay-discount.net', description: 'Huge discounts offered. Page templates are exact duplicates of official pages.', status: 'Reviewed', submitted_at: new Date(Date.now() - 3600000*24).toISOString() }
            ],
            spam_websites: [],
            visitor_logs: [
                {
                    id: "v1",
                    ip: "103.251.140.18",
                    session_start: "02/07/2026, 12:15:00 AM IST",
                    session_end: "02/07/2026, 12:22:30 AM IST",
                    duration: "7m 30s",
                    actions: [
                        "[12:15:00 AM] Opened Portal Homepage",
                        "[12:16:30 AM] Searched for 'Ramayana Hotel'",
                        "[12:18:00 AM] Scanned Verification QR Code",
                        "[12:20:15 AM] Viewed verified certificate page"
                    ],
                    location: "Ayodhya, Uttar Pradesh, India",
                    user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15"
                },
                {
                    id: "v2",
                    ip: "122.161.49.201",
                    session_start: "02/07/2026, 01:05:00 AM IST",
                    session_end: "02/07/2026, 01:06:15 AM IST",
                    duration: "1m 15s",
                    actions: [
                        "[01:05:00 AM] Opened Portal Homepage",
                        "[01:05:30 AM] Clicked 'Report Phishing'",
                        "[01:06:00 AM] Submitted suspicious link: http://fake-ayodhya-hotel.com"
                    ],
                    location: "New Delhi, Delhi, India",
                    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            ]
        };
        const dir = path.dirname(dbPath);
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(dbPath, JSON.stringify(initialDb, null, 2), 'utf8');
        return initialDb;
    }
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        const parsed = JSON.parse(data);
        if (!parsed.visitor_logs) {
            parsed.visitor_logs = [
                {
                    id: "v1",
                    ip: "103.251.140.18",
                    session_start: "02/07/2026, 12:15:00 AM IST",
                    session_end: "02/07/2026, 12:22:30 AM IST",
                    duration: "7m 30s",
                    actions: [
                        "[12:15:00 AM] Opened Portal Homepage",
                        "[12:16:30 AM] Searched for 'Ramayana Hotel'",
                        "[12:18:00 AM] Scanned Verification QR Code",
                        "[12:20:15 AM] Viewed verified certificate page"
                    ],
                    location: "Ayodhya, Uttar Pradesh, India",
                    user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15"
                },
                {
                    id: "v2",
                    ip: "122.161.49.201",
                    session_start: "02/07/2026, 01:05:00 AM IST",
                    session_end: "02/07/2026, 01:06:15 AM IST",
                    duration: "1m 15s",
                    actions: [
                        "[01:05:00 AM] Opened Portal Homepage",
                        "[01:05:30 AM] Clicked 'Report Phishing'",
                        "[01:06:00 AM] Submitted suspicious link: http://fake-ayodhya-hotel.com"
                    ],
                    location: "New Delhi, Delhi, India",
                    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                }
            ];
            fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2), 'utf8');
        }
        return parsed;
    } catch (e) {
        console.error("Error reading database json", e);
        return {};
    }
}

function writeDb(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error("Error writing database json", e);
    }
}

class QueryBuilder {
    constructor(tableName) {
        this.tableName = tableName;
        this.filters = [];
        this.limitCount = null;
        this.singleRow = false;
        this.op = 'select';
        this.opData = null;
        this.selectFields = '*';
    }

    select(fields) {
        this.selectFields = fields || '*';
        return this;
    }

    insert(data) {
        this.op = 'insert';
        this.opData = data;
        return this;
    }

    update(data) {
        this.op = 'update';
        this.opData = data;
        return this;
    }

    eq(column, value) {
        this.filters.push((row, db) => {
            if (column.includes('.')) {
                const [rel, col] = column.split('.');
                const relIdField = rel === 'verified_hotels' ? 'target_hotel_id' : null;
                if (relIdField) {
                    const relRow = db[rel].find(r => r.id === row[relIdField]);
                    return relRow && relRow[col] === value;
                }
                return false;
            }
            return row[column] === value;
        });
        return this;
    }

    or(condition) {
        this.filters.push((row) => {
            const parts = condition.split(',');
            for (const part of parts) {
                const match = part.match(/^([^.]+)\.(ilike|eq)\.(.+)$/);
                if (match) {
                    const [_, col, operator, val] = match;
                    const cleanVal = val.replace(/%/g, '').toLowerCase();
                    const rowVal = String(row[col] || '').toLowerCase();
                    if (operator === 'ilike' && rowVal.includes(cleanVal)) {
                        return true;
                    }
                    if (operator === 'eq' && rowVal === cleanVal) {
                        return true;
                    }
                }
            }
            return false;
        });
        return this;
    }

    ilike(column, pattern) {
        const cleanVal = pattern.replace(/%/g, '').toLowerCase();
        this.filters.push((row) => {
            const rowVal = String(row[column] || '').toLowerCase();
            return rowVal.includes(cleanVal);
        });
        return this;
    }

    limit(num) {
        this.limitCount = num;
        return this;
    }

    single() {
        this.singleRow = true;
        return this;
    }

    resolveRelations(row, db) {
        const result = { ...row };
        if (this.tableName === 'suspicious_links') {
            const hotel = db.verified_hotels.find(h => h.id === row.target_hotel_id);
            if (hotel) {
                result.verified_hotels = { ...hotel };
            }
        }
        if (this.tableName === 'verified_hotels') {
            const user = db.system_users.find(u => u.id === row.thana_id);
            if (user) {
                result.system_users = { ...user };
            }
        }
        return result;
    }

    async then(onfulfilled, onrejected) {
        try {
            const db = readDb();
            const table = db[this.tableName] || [];

            if (this.op === 'select') {
                let filtered = [...table];
                for (const filter of this.filters) {
                    filtered = filtered.filter(row => filter(row, db));
                }
                let resolved = filtered.map(row => this.resolveRelations(row, db));
                
                let data = resolved;
                if (this.singleRow) {
                    data = resolved.length > 0 ? resolved[0] : null;
                } else if (this.limitCount !== null) {
                    data = resolved.slice(0, this.limitCount);
                }
                
                return onfulfilled({ data, error: null });
            } 
            
            if (this.op === 'insert') {
                const rowsToInsert = Array.isArray(this.opData) ? this.opData : [this.opData];
                const insertedRows = rowsToInsert.map(row => {
                    const newRow = {
                        id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                        created_at: new Date().toISOString(),
                        submitted_at: new Date().toISOString(),
                        detected_on: new Date().toISOString(),
                        ...row
                    };
                    table.push(newRow);
                    return newRow;
                });
                
                db[this.tableName] = table;
                writeDb(db);

                const returnData = Array.isArray(this.opData) ? insertedRows : insertedRows[0];
                return onfulfilled({ data: returnData, error: null });
            }

            if (this.op === 'update') {
                let updatedCount = 0;
                const updatedRows = [];
                for (let i = 0; i < table.length; i++) {
                    const row = table[i];
                    let match = true;
                    for (const filter of this.filters) {
                        if (!filter(row, db)) {
                            match = false;
                            break;
                        }
                    }
                    if (match) {
                        table[i] = { ...row, ...this.opData };
                        updatedRows.push(table[i]);
                        updatedCount++;
                    }
                }
                if (updatedCount > 0) {
                    db[this.tableName] = table;
                    writeDb(db);
                }
                return onfulfilled({ data: this.singleRow ? updatedRows[0] : updatedRows, error: null });
            }
        } catch (err) {
            return onfulfilled({ data: null, error: err });
        }
    }
}

const mockSupabase = {
    from: (tableName) => new QueryBuilder(tableName),
    auth: {
        signInWithPassword: async ({ email, password }) => {
            const db = readDb();
            const user = db.system_users.find(u => u.nic_email === email);
            if (user) {
                // For local sandbox, allow standard login check or pass-through
                return { data: { user, session: { access_token: 'mock-token' } }, error: null };
            }
            return { data: null, error: { message: 'Invalid credentials' } };
        },
        signOut: async () => {
            return { error: null };
        },
        getSession: async () => {
            return { data: { session: null }, error: null };
        },
        onAuthStateChange: (callback) => {
            // Noop
            return { data: { subscription: { unsubscribe: () => {} } } };
        }
    }
};

module.exports = mockSupabase;

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('node:crypto');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const JWT_SECRET = process.env.JWT_SECRET || 'local-development-secret-change-me';
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lost_and_found_db',
    waitForConnections: true,
    connectionLimit: 10,
});

function publicUser(user) {
    const { password_hash, ...profile } = user;
    return profile;
}

function createToken(user) {
    return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    try {
        req.auth = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
}

function requireAdmin(req, res, next) {
    if (req.auth?.role !== 'admin') return res.status(403).json({ error: 'Staff access required' });
    next();
}

function mapItem(row) {
    if (!row) return null;
    const item = { ...row };
    if (row.campus_relation_id) {
        item.campus = { id: row.campus_relation_id, name: row.campus_name, created_at: row.campus_created_at };
    } else item.campus = null;
    if (row.reporter_id) {
        item.reporter = {
            id: row.reporter_id,
            email: row.reporter_email,
            full_name: row.reporter_full_name,
            student_number: row.reporter_student_number,
            staff_number: row.reporter_staff_number,
            role: row.reporter_role,
            phone: row.reporter_phone,
            created_at: row.reporter_created_at,
        };
    } else item.reporter = null;
    delete item.campus_relation_id;
    delete item.campus_name;
    delete item.campus_created_at;
    delete item.reporter_id;
    delete item.reporter_email;
    delete item.reporter_full_name;
    delete item.reporter_student_number;
    delete item.reporter_staff_number;
    delete item.reporter_role;
    delete item.reporter_phone;
    delete item.reporter_created_at;
    return item;
}

const itemSelect = `SELECT i.*, c.id AS campus_relation_id, c.name AS campus_name,
    c.created_at AS campus_created_at, u.id AS reporter_id, u.email AS reporter_email,
    u.full_name AS reporter_full_name, u.student_number AS reporter_student_number,
    u.staff_number AS reporter_staff_number, u.role AS reporter_role,
    u.phone AS reporter_phone, u.created_at AS reporter_created_at,
    EXISTS(SELECT 1 FROM finder_reports fr WHERE fr.item_id = i.id) AS has_finder_report
    FROM items i LEFT JOIN campuses c ON c.id = i.campus_id
    LEFT JOIN users u ON u.id = i.user_id`;

function asyncRoute(handler) {
    return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

app.get('/api/health', asyncRoute(async (_req, res) => {
    await db.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
}));

app.post('/api/auth/register', asyncRoute(async (req, res) => {
    const { email, password, full_name, student_number } = req.body;
    if (!email || !password || !full_name || !student_number) {
        return res.status(400).json({ error: 'Name, email, student number, and password are required' });
    }
    if (String(password).length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const id = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    await db.query(
        'INSERT INTO users (id, email, full_name, password_hash, role, student_number) VALUES (?, ?, ?, ?, ?, ?)',
        [id, String(email).trim().toLowerCase(), String(full_name).trim(), passwordHash, 'student', String(student_number).trim()]
    );
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    const user = publicUser(rows[0]);
    res.status(201).json({ token: createToken(user), user });
}));

async function authenticate(req, res) {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [String(email).trim().toLowerCase()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    const profile = publicUser(user);
    res.json({ token: createToken(profile), user: profile });
}

app.post('/api/auth/login', asyncRoute(authenticate));
app.post('/api/auth/staff-login', asyncRoute(async (req, res) => {
    const { staff_number, password } = req.body;
    if (!staff_number) return res.status(400).json({ error: 'Staff number is required' });
    const [rows] = await db.query('SELECT * FROM users WHERE staff_number = ? AND role = \'admin\'', [String(staff_number).trim()]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
        return res.status(401).json({ error: 'Invalid staff number or password' });
    }
    const profile = publicUser(user);
    res.json({ token: createToken(profile), user: profile });
}));
app.get('/api/auth/me', requireAuth, asyncRoute(async (req, res) => {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.auth.id]);
    if (!rows[0]) return res.status(401).json({ error: 'Account no longer exists' });
    res.json(publicUser(rows[0]));
}));
app.patch('/api/auth/profile', requireAuth, asyncRoute(async (req, res) => {
    const { full_name, phone } = req.body;
    await db.query('UPDATE users SET full_name = ?, phone = ? WHERE id = ?', [full_name, phone || null, req.auth.id]);
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.auth.id]);
    res.json(publicUser(rows[0]));
}));

app.get('/api/campuses', asyncRoute(async (_req, res) => {
    const [rows] = await db.query('SELECT * FROM campuses ORDER BY name ASC');
    res.json(rows);
}));

app.get('/api/items', asyncRoute(async (req, res) => {
    const { search = '', category, campus_id, item_type, status, sort = 'newest' } = req.query;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, Number.parseInt(req.query.pageSize, 10) || 12));
    const clauses = [];
    const values = [];
    if (search) { clauses.push('(i.title LIKE ? OR i.description LIKE ? OR i.location LIKE ?)'); values.push(`%${search}%`, `%${search}%`, `%${search}%`); }
    if (category && category !== 'all') { clauses.push('i.category = ?'); values.push(category); }
    if (campus_id && campus_id !== 'all') { clauses.push('i.campus_id = ?'); values.push(campus_id); }
    if (item_type && item_type !== 'all') { clauses.push('i.item_type = ?'); values.push(item_type); }
    if (status && status !== 'all') { clauses.push('i.status = ?'); values.push(status); }
    const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM items i${where}`, values);
    const direction = sort === 'oldest' ? 'ASC' : 'DESC';
    const [rows] = await db.query(`${itemSelect}${where} ORDER BY i.created_at ${direction} LIMIT ? OFFSET ?`, [...values, pageSize, (page - 1) * pageSize]);
    res.json({ items: rows.map(mapItem), total: countRows[0].total });
}));
app.get('/api/items/:id', asyncRoute(async (req, res) => {
    const [rows] = await db.query(`${itemSelect} WHERE i.id = ?`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Item not found' });
    res.json(mapItem(rows[0]));
}));
app.post('/api/items', requireAuth, asyncRoute(async (req, res) => {
    const { title, category, description, image_url, campus_id, location, item_type, date_event, additional_details } = req.body;
    if (!title || !category || !description || !campus_id || !location || !date_event || !['lost', 'found'].includes(item_type)) {
        return res.status(400).json({ error: 'Complete all required item fields' });
    }
    const id = randomUUID();
    await db.query(`INSERT INTO items
        (id, user_id, title, category, description, image_url, campus_id, location, item_type, status, date_event, additional_details)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, req.auth.id, title, category, description, image_url || null, campus_id, location, item_type, item_type, date_event, additional_details || null]);
    const [rows] = await db.query(`${itemSelect} WHERE i.id = ?`, [id]);
    res.status(201).json(mapItem(rows[0]));
}));
app.get('/api/me/items', requireAuth, asyncRoute(async (req, res) => {
    const [rows] = await db.query(`${itemSelect} WHERE i.user_id = ? ORDER BY i.created_at DESC`, [req.auth.id]);
    res.json(rows.map(mapItem));
}));
app.post('/api/items/:id/finder-reports', requireAuth, asyncRoute(async (req, res) => {
    const { found_location, found_date, additional_details } = req.body;
    if (!found_location || !found_date) return res.status(400).json({ error: 'Found location and date are required' });
    const [items] = await db.query('SELECT id, user_id, item_type, status FROM items WHERE id = ?', [req.params.id]);
    const item = items[0];
    if (!item || item.item_type !== 'lost' || item.status !== 'lost') {
        return res.status(409).json({ error: 'Finder reports can only be submitted for an active lost-item report' });
    }
    if (item.user_id === req.auth.id) return res.status(403).json({ error: 'You cannot report finding your own lost item' });
    const reportId = randomUUID();
    await db.query(`INSERT INTO finder_reports (id, item_id, finder_id, found_location, found_date, additional_details)
        VALUES (?, ?, ?, ?, ?, ?)`, [reportId, item.id, req.auth.id, found_location.trim(), found_date, additional_details?.trim() || null]);
    await db.query(`INSERT INTO admin_actions (id, admin_id, action, item_id, description)
        VALUES (?, ?, ?, ?, ?)`, [randomUUID(), req.auth.id, 'Finder reported item', item.id,
        `Finder report submitted: found at ${found_location.trim()} on ${found_date}. ${additional_details?.trim() || ''}`.trim()]);
    res.status(201).json({ id: reportId, item_id: item.id, message: 'Report submitted. Please hand the item to university staff.' });
}));
app.get('/api/admin/finder-reports', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
    const [rows] = await db.query(`SELECT fr.*, i.title AS item_title, i.item_type, i.status AS item_status,
        i.received_at, f.id AS finder_profile_id, f.full_name AS finder_name, f.email AS finder_email,
        f.student_number AS finder_student_number FROM finder_reports fr
        JOIN items i ON i.id = fr.item_id JOIN users f ON f.id = fr.finder_id
        ORDER BY (fr.received_at IS NULL) DESC, fr.created_at DESC`);
    res.json(rows.map(({ finder_profile_id, finder_name, finder_email, finder_student_number, ...report }) => ({
        ...report,
        finder: { id: finder_profile_id, full_name: finder_name, email: finder_email, student_number: finder_student_number },
    })));
}));
app.post('/api/admin/items/:id/receive', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
    const { finder_report_id } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [items] = await connection.query('SELECT * FROM items WHERE id = ? FOR UPDATE', [req.params.id]);
        const item = items[0];
        if (!item) { await connection.rollback(); return res.status(404).json({ error: 'Item not found' }); }
        if (item.received_at) { await connection.rollback(); return res.status(409).json({ error: 'This item has already been received by staff' }); }
        if (item.item_type === 'lost') {
            if (!finder_report_id) { await connection.rollback(); return res.status(400).json({ error: 'Select the finder report being received' }); }
            const [reports] = await connection.query('SELECT id FROM finder_reports WHERE id = ? AND item_id = ? FOR UPDATE', [finder_report_id, item.id]);
            if (!reports[0]) { await connection.rollback(); return res.status(404).json({ error: 'Finder report not found for this lost item' }); }
        } else if (item.item_type !== 'found' || item.status !== 'found') {
            await connection.rollback();
            return res.status(409).json({ error: 'Only reported found items can be received' });
        }
        await connection.query(`UPDATE items SET status = 'found', received_by = ?, received_at = CURRENT_TIMESTAMP WHERE id = ?`, [req.auth.id, item.id]);
        if (finder_report_id) await connection.query('UPDATE finder_reports SET received_by = ?, received_at = CURRENT_TIMESTAMP WHERE id = ?', [req.auth.id, finder_report_id]);
        await connection.query(`INSERT INTO admin_actions (id, admin_id, action, item_id, description)
            VALUES (?, ?, ?, ?, ?)`, [randomUUID(), req.auth.id, 'Staff received item', item.id,
            finder_report_id ? 'Staff confirmed receipt of item from the finder.' : 'Staff confirmed receipt of reported found item.']);
        await connection.commit();
        res.json({ success: true });
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
}));
app.get('/api/me/claims', requireAuth, asyncRoute(async (req, res) => {
    const [rows] = await db.query(`SELECT cl.*, i.id AS item_id_join, i.title AS item_title, i.category AS item_category,
        i.location AS item_location, i.image_url AS item_image_url, i.status AS item_status,
        i.item_type AS item_type, i.user_id AS item_user_id, i.description AS item_description,
        i.campus_id AS item_campus_id, i.date_event AS item_date_event, i.additional_details AS item_additional_details,
        i.created_at AS item_created_at, i.updated_at AS item_updated_at
        FROM claims cl LEFT JOIN items i ON i.id = cl.item_id WHERE cl.claimant_id = ? ORDER BY cl.created_at DESC`, [req.auth.id]);
    res.json(rows.map(mapClaim));
}));
app.post('/api/claims', requireAuth, asyncRoute(async (req, res) => {
    const { item_id, reason, identifying_details, additional_info, contact_details } = req.body;
    if (!item_id || !reason || !identifying_details || !contact_details) return res.status(400).json({ error: 'Complete all required claim fields' });
    const [items] = await db.query('SELECT id, user_id, item_type, status, received_at FROM items WHERE id = ?', [item_id]);
    const item = items[0];
    if (!item || item.status !== 'found' || !item.received_at) {
        return res.status(409).json({ error: 'Claims are available only after staff receive a found item' });
    }
    if ((item.item_type === 'found' && item.user_id === req.auth.id) || (item.item_type === 'lost' && item.user_id !== req.auth.id)) {
        return res.status(403).json({ error: 'You are not eligible to claim this item' });
    }
    const [existingClaims] = await db.query(`SELECT id FROM claims WHERE item_id = ? AND claimant_id = ? AND status IN ('pending', 'approved')`, [item_id, req.auth.id]);
    if (existingClaims.length) return res.status(409).json({ error: 'You already have an active claim for this item' });
    const id = randomUUID();
    await db.query(`INSERT INTO claims (id, item_id, claimant_id, reason, identifying_details, additional_info, contact_details)
        VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, item_id, req.auth.id, reason, identifying_details, additional_info || null, contact_details]);
    await db.query(`INSERT INTO admin_actions (id, admin_id, action, item_id, claim_id, description)
        VALUES (?, ?, ?, ?, ?, ?)`, [randomUUID(), req.auth.id, 'Claim submitted', item_id, id, 'Student submitted an ownership claim for staff verification.']);
    const [rows] = await db.query('SELECT * FROM claims WHERE id = ?', [id]);
    res.status(201).json(rows[0]);
}));

function mapClaim(row) {
    const claim = { ...row };
    if (row.item_id_join) {
        claim.item = {
            id: row.item_id_join, title: row.item_title, category: row.item_category, location: row.item_location,
            image_url: row.item_image_url, status: row.item_status, item_type: row.item_type, user_id: row.item_user_id,
            description: row.item_description, campus_id: row.item_campus_id, date_event: row.item_date_event,
            additional_details: row.item_additional_details, created_at: row.item_created_at, updated_at: row.item_updated_at,
        };
    } else claim.item = null;
    for (const key of ['item_id_join', 'item_title', 'item_category', 'item_location', 'item_image_url', 'item_status', 'item_type', 'item_user_id', 'item_description', 'item_campus_id', 'item_date_event', 'item_additional_details', 'item_created_at', 'item_updated_at']) delete claim[key];
    return claim;
}

app.get('/api/admin/items', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
    const [rows] = await db.query(`${itemSelect} ORDER BY i.created_at DESC`);
    res.json(rows.map(mapItem));
}));
app.put('/api/admin/items/:id/status', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
    const { status, notes = '' } = req.body;
    if (!['lost', 'found'].includes(status)) return res.status(400).json({ error: 'CLAIMED requires claim approval; RETURNED requires a verified handover' });
    const [current] = await db.query('SELECT status, item_type, received_at FROM items WHERE id = ?', [req.params.id]);
    if (!current[0]) return res.status(404).json({ error: 'Item not found' });
    if (['claimed', 'returned'].includes(current[0].status)) return res.status(409).json({ error: 'Claimed or returned items cannot be reset through status updates' });
    if (status === 'lost' && (current[0].item_type !== 'lost' || current[0].received_at)) return res.status(409).json({ error: 'An item already received by staff cannot return to LOST status' });
    if (status === 'found' && !current[0].received_at) return res.status(409).json({ error: 'Confirm staff receipt before setting an item to FOUND' });
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        await connection.query('UPDATE items SET status = ? WHERE id = ?', [status, req.params.id]);
        await connection.query(`INSERT INTO admin_actions (id, admin_id, action, item_id, description)
            VALUES (?, ?, ?, ?, ?)`, [randomUUID(), req.auth.id, 'Updated item status', req.params.id, notes || `Status changed to ${status}`]);
        await connection.commit();
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
    res.json({ success: true });
}));
app.get('/api/admin/claims', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
    const status = req.query.status;
    const where = status && status !== 'all' ? 'WHERE cl.status = ?' : '';
    const params = where ? [status] : [];
    const [rows] = await db.query(`SELECT cl.*, i.id AS item_id_join, i.title AS item_title, i.category AS item_category,
        i.location AS item_location, i.image_url AS item_image_url, i.status AS item_status, i.item_type AS item_type,
        i.user_id AS item_user_id, i.description AS item_description, i.campus_id AS item_campus_id,
        i.date_event AS item_date_event, i.additional_details AS item_additional_details,
        i.created_at AS item_created_at, i.updated_at AS item_updated_at,
        u.id AS claimant_id_join, u.email AS claimant_email, u.full_name AS claimant_full_name,
        u.student_number AS claimant_student_number, u.staff_number AS claimant_staff_number,
        u.role AS claimant_role, u.phone AS claimant_phone, u.created_at AS claimant_created_at
        FROM claims cl LEFT JOIN items i ON i.id = cl.item_id LEFT JOIN users u ON u.id = cl.claimant_id
        ${where} ORDER BY cl.created_at DESC`, params);
    res.json(rows.map((row) => {
        const claim = mapClaim(row);
        if (row.claimant_id_join) claim.claimant = {
            id: row.claimant_id_join, email: row.claimant_email, full_name: row.claimant_full_name,
            student_number: row.claimant_student_number, staff_number: row.claimant_staff_number,
            role: row.claimant_role, phone: row.claimant_phone, created_at: row.claimant_created_at,
        };
        for (const key of ['claimant_id_join', 'claimant_email', 'claimant_full_name', 'claimant_student_number', 'claimant_staff_number', 'claimant_role', 'claimant_phone', 'claimant_created_at']) delete claim[key];
        return claim;
    }));
}));
async function reviewClaim(req, res, status) {
    const { notes = '' } = req.body;
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [claims] = await connection.query('SELECT * FROM claims WHERE id = ? FOR UPDATE', [req.params.id]);
        if (!claims[0]) { await connection.rollback(); return res.status(404).json({ error: 'Claim not found' }); }
        const claim = claims[0];
        if (claim.status !== 'pending') { await connection.rollback(); return res.status(409).json({ error: 'Only pending claims can be reviewed' }); }
        if (claim.claimant_id === req.auth.id) { await connection.rollback(); return res.status(403).json({ error: 'You cannot approve or reject your own claim' }); }
        const [items] = await connection.query('SELECT * FROM items WHERE id = ? FOR UPDATE', [claim.item_id]);
        const item = items[0];
        if (!item || item.status !== 'found' || !item.received_at) {
            await connection.rollback();
            return res.status(409).json({ error: 'The item must be in staff custody before a claim can be reviewed' });
        }
        if ((item.item_type === 'found' && item.user_id === claim.claimant_id) || (item.item_type === 'lost' && item.user_id !== claim.claimant_id)) {
            await connection.rollback();
            return res.status(403).json({ error: 'The claimant is not eligible for this item' });
        }
        await connection.query('UPDATE claims SET status = ?, verification_notes = ?, verified_by = ?, verified_at = CURRENT_TIMESTAMP WHERE id = ?', [status, notes || null, req.auth.id, req.params.id]);
        if (status === 'approved') await connection.query('UPDATE items SET status = \'claimed\' WHERE id = ?', [claim.item_id]);
        await connection.query(`INSERT INTO admin_actions (id, admin_id, action, item_id, claim_id, description)
            VALUES (?, ?, ?, ?, ?, ?)`, [randomUUID(), req.auth.id, status === 'approved' ? 'Approved claim' : 'Rejected claim', claim.item_id, req.params.id, notes || `Claim ${status}`]);
        await connection.commit();
        res.json({ success: true });
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
}
app.put('/api/admin/claims/:id/approve', requireAuth, requireAdmin, asyncRoute((req, res) => reviewClaim(req, res, 'approved')));
app.put('/api/admin/claims/:id/reject', requireAuth, requireAdmin, asyncRoute((req, res) => reviewClaim(req, res, 'rejected')));
app.post('/api/admin/items/:id/return', requireAuth, requireAdmin, asyncRoute(async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [items] = await connection.query('SELECT * FROM items WHERE id = ? FOR UPDATE', [req.params.id]);
        const item = items[0];
        if (!item) { await connection.rollback(); return res.status(404).json({ error: 'Item not found' }); }
        if (item.status !== 'claimed' || !item.received_at) {
            await connection.rollback();
            return res.status(409).json({ error: 'Only an item in staff custody with an approved claim can be returned' });
        }
        const [claims] = await connection.query(`SELECT id, claimant_id FROM claims WHERE item_id = ? AND status = 'approved' ORDER BY verified_at DESC LIMIT 1 FOR UPDATE`, [item.id]);
        if (!claims[0]) { await connection.rollback(); return res.status(409).json({ error: 'No approved claim is recorded for this item' }); }
        await connection.query(`UPDATE items SET status = 'returned', returned_to = ?, returned_by = ?, returned_at = CURRENT_TIMESTAMP WHERE id = ?`, [claims[0].claimant_id, req.auth.id, item.id]);
        await connection.query(`INSERT INTO admin_actions (id, admin_id, action, item_id, claim_id, description)
            VALUES (?, ?, ?, ?, ?, ?)`, [randomUUID(), req.auth.id, 'Item returned to owner', item.id, claims[0].id, 'Staff recorded physical collection by the approved claimant.']);
        await connection.commit();
        res.json({ success: true });
    } catch (error) { await connection.rollback(); throw error; }
    finally { connection.release(); }
}));
app.get('/api/admin/users', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
    const [rows] = await db.query('SELECT id, email, full_name, student_number, staff_number, role, phone, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
}));
app.get('/api/admin/actions', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
    const [rows] = await db.query(`SELECT a.*, u.id AS admin_profile_id, u.full_name AS admin_name,
        i.id AS action_item_id, i.title AS item_title FROM admin_actions a
        LEFT JOIN users u ON u.id = a.admin_id LEFT JOIN items i ON i.id = a.item_id ORDER BY a.created_at DESC`);
    res.json(rows.map(({ admin_profile_id, admin_name, action_item_id, item_title, ...action }) => ({
        ...action, admin: admin_profile_id ? { id: admin_profile_id, full_name: admin_name } : null,
        item: action_item_id ? { id: action_item_id, title: item_title } : null,
    })));
}));
app.get('/api/me/stats', requireAuth, asyncRoute(async (req, res) => {
    const [[items]] = await db.query(`SELECT COUNT(*) AS myItems, SUM(status = 'returned') AS returnedItems FROM items WHERE user_id = ?`, [req.auth.id]);
    const [[claims]] = await db.query(`SELECT COUNT(*) AS activeClaims FROM claims WHERE claimant_id = ? AND status = 'pending'`, [req.auth.id]);
    res.json({ myItems: Number(items.myItems), activeClaims: Number(claims.activeClaims), returnedItems: Number(items.returnedItems || 0) });
}));
app.get('/api/admin/stats', requireAuth, requireAdmin, asyncRoute(async (_req, res) => {
    const [[items]] = await db.query(`SELECT COUNT(*) AS totalItems, SUM(status = 'lost') AS lostItems,
        SUM(status = 'found') AS foundItems, SUM(status = 'claimed') AS claimedItems,
        SUM(status = 'returned') AS returnedItems FROM items`);
    const [[claims]] = await db.query("SELECT COUNT(*) AS pendingClaims FROM claims WHERE status = 'pending'");
    res.json(Object.fromEntries(Object.entries({ ...items, ...claims }).map(([key, value]) => [key, Number(value || 0)])));
}));

app.use((error, _req, res, _next) => {
    const status = error.code === 'ER_DUP_ENTRY' ? 409 : 500;
    res.status(status).json({ error: status === 409 ? 'That email or student/staff number is already registered' : error.message });
});

const PORT = Number(process.env.PORT) || 5000;
async function start() {
    await db.query('SELECT 1');
    const [admins] = await db.query('SELECT id FROM users WHERE staff_number = ?', ['STAFF001']);
    if (!admins.length) {
        const passwordHash = await bcrypt.hash('admin1234', 10);
        await db.query(`INSERT INTO users (id, email, full_name, password_hash, role, staff_number)
            VALUES (?, ?, ?, ?, 'admin', ?)`, [randomUUID(), 'STAFF001@staff.ac.za', 'Admin User', passwordHash, 'STAFF001']);
        console.log('Created local demo staff account: STAFF001 / admin1234');
    }
    app.listen(PORT, () => console.log(`MySQL API running on http://localhost:${PORT}`));
}
start().catch((error) => {
    console.error('Unable to start MySQL API. Check the database configuration and ensure the schema has been imported.', error.message);
    process.exitCode = 1;
});

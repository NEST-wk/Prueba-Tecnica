import { getConnection } from '../config/db.js';

export async function getUsers(req, res) {
    const conn = await getConnection();
    const [rows] = await conn.query("SELECT * FROM users");
    await conn.end();
    res.json(rows);
}

export async function createUser(req, res) {
    const { username, email } = req.body;
    const conn = await getConnection();
    const [result] = await conn.query("INSERT INTO users (username, email) VALUES (?, ?)", [username, email]);
    await conn.end();
    res.status(201).json({ id: result.insertId, username, email });
}

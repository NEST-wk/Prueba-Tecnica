import { getConnection } from '../config/db.js';

// Crear plantilla
export async function createTemplate(req, res) {
    const { user_id, name, sql_text, parameters_json, description } = req.body;
    const conn = await getConnection();
    const [result] = await conn.query(`
    INSERT INTO query_templates (user_id, name, sql_text, parameters_json, description)
    VALUES (?, ?, ?, ?, ?)
  `, [user_id, name, sql_text, JSON.stringify(parameters_json), description]);
    await conn.end();
    res.status(201).json({ id: result.insertId });
}

// Obtener todas las plantillas
export async function getTemplates(req, res) {
    const conn = await getConnection();
    const [rows] = await conn.query(`SELECT * FROM query_templates`);
    await conn.end();
    res.json(rows);
}

// Obtener una por ID
export async function getTemplateById(req, res) {
    const conn = await getConnection();
    const [rows] = await conn.query(`SELECT * FROM query_templates WHERE id = ?`, [req.params.id]);
    await conn.end();
    if (rows.length === 0) return res.status(404).send('Plantilla no encontrada');
    res.json(rows[0]);
}

// Eliminar
export async function deleteTemplate(req, res) {
    const conn = await getConnection();
    await conn.query(`DELETE FROM query_templates WHERE id = ?`, [req.params.id]);
    await conn.end();
    res.status(204).send();
}

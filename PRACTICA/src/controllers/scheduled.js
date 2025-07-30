import { getConnection } from '../config/db.js';

// Crear tarea programada
export async function createScheduledQuery(req, res) {
    const { template_id, cron_expression, email_to, is_active } = req.body;

    const conn = await getConnection();
    const [result] = await conn.query(`
    INSERT INTO scheduled_queries (template_id, cron_expression, email_to, is_active)
    VALUES (?, ?, ?, ?)
  `, [template_id, cron_expression, email_to, is_active ?? true]);

    await conn.end();
    res.status(201).json({ id: result.insertId });
}

// Listar todas
export async function getScheduledQueries(req, res) {
    const conn = await getConnection();
    const [rows] = await conn.query(`SELECT * FROM scheduled_queries`);
    await conn.end();
    res.json(rows);
}

// Ver por ID
export async function getScheduledQueryById(req, res) {
    const { id } = req.params;
    const conn = await getConnection();
    const [rows] = await conn.query(`SELECT * FROM scheduled_queries WHERE id = ?`, [id]);
    await conn.end();
    if (rows.length === 0) return res.status(404).send('No encontrado');
    res.json(rows[0]);
}

// Eliminar
export async function deleteScheduledQuery(req, res) {
    const { id } = req.params;
    const conn = await getConnection();
    try {
        // 1) limpiar historial
        await conn.query(
            'DELETE FROM query_results WHERE scheduled_query_id = ?',
            [id]
        );

        // 2) borrar la tarea
        const [result] = await conn.query(
            'DELETE FROM scheduled_queries WHERE id = ?',
            [id]
        );
        await conn.end();

        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Tarea no encontrada' });

        res.status(204).send();          // ✔️ eliminada
    } catch (err) {
        await conn.end();
        console.error('❌ Error al eliminar tarea satisfactoriamente:', err.message);
        res.status(500).json({ error: 'Error al eliminar la tarea' });
    }
}
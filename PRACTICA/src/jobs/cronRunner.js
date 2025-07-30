import cron from 'node-cron';
import pRetry from 'p-retry';
import { getConnection } from '../config/db.js';
import { generateCsvBuffer } from '../utils/csv.js';
import { transporter } from '../config/mail.js';

// ────────────────────────────────────────────────────────────────
// Carga las tareas ACTIVAS y las registra en node-cron
// ────────────────────────────────────────────────────────────────
export async function loadScheduledJobs() {
    const conn = await getConnection();
    const [jobs] = await conn.query(`
    SELECT sq.*, qt.sql_text, qt.parameters_json
      FROM scheduled_queries sq
      JOIN query_templates qt ON qt.id = sq.template_id
     WHERE sq.is_active = 1
  `);
    await conn.end();

    if (jobs.length === 0) {
        console.log('⚠️  No hay tareas programadas activas.');
        return;
    }
    jobs.forEach(scheduleOneJob);
}

// ────────────────────────────────────────────────────────────────
function scheduleOneJob(job) {
    if (!cron.validate(job.cron_expression)) {
        console.error(`❌ Cron inválido: ${job.cron_expression} (id ${job.id})`);
        return;
    }

    cron.schedule(job.cron_expression, async () => {
        console.log(`⏰ Ejecutando tarea #${job.id}…`);

        const conn = await getConnection();
        const log = { status: 'success', error_message: null, result_csv: null };

        try {
            /* ---------- Parseo robusto de parámetros ---------- */
            let params = [];
            if (typeof job.parameters_json === 'string') {
                params = JSON.parse(job.parameters_json);
            } else if (Array.isArray(job.parameters_json)) {
                params = job.parameters_json;
            }

            /* ---------- Ejecutar SQL ---------- */
            const [rows] = await conn.query(job.sql_text, params);

            /* ---------- CSV ---------- */
            const csvBuffer = await generateCsvBuffer(rows);
            log.result_csv = csvBuffer.toString('base64');

            /* ---------- ENVÍO CON REINTENTOS ---------- */
            await pRetry(
                () =>
                    transporter.sendMail({
                        from: `"Consultas API" <${process.env.EMAIL_USER}>`,
                        to: job.email_to,
                        subject: `Reporte automático (tarea #${job.id})`,
                        text: 'Consulta ejecutada correctamente. Se adjunta el CSV.',
                        attachments: [{ filename: 'reporte.csv', content: csvBuffer }]
                    }),
                {
                    retries: 3,                   // nº de reintentos
                    factor: 2,                    // back-off exponencial: 1s, 2s, 4s…
                    onFailedAttempt: attemptErr => {
                        const { attemptNumber, retriesLeft, message } = attemptErr;
                        console.warn(
                            `⚠️  Tarea #${job.id} – intento ${attemptNumber} falló (${message}). ` +
                            `${retriesLeft} reintentos pendientes…`
                        );
                    }
                }
            );

            console.log(`✅ Tarea #${job.id}: correo enviado.`);
        } catch (err) {
            console.error(`❌ Tarea #${job.id} falló: ${err.message}`);
            log.status = 'error';
            log.error_message = err.message;
        }

        /* ---------- Registrar resultado ---------- */
        try {
            await conn.query(
                `INSERT INTO query_results
           (scheduled_query_id, status, result_csv, error_message)
         VALUES (?, ?, ?, ?)`,
                [job.id, log.status, log.result_csv, log.error_message]
            );
            await conn.query(`UPDATE scheduled_queries SET last_run = NOW() WHERE id = ?`, [job.id]);
        } finally {
            await conn.end();
        }
    });

    console.log(`📅 Tarea #${job.id} registrada con cron "${job.cron_expression}"`);
}

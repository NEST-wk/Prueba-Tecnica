import { getConnection } from './db.js';

export async function initDb() {
    const conn = await getConnection();

    await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(255)
    )
  `);

    // Plantillas de consulta
    await conn.query(`
    CREATE TABLE IF NOT EXISTS query_templates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      name VARCHAR(255) NOT NULL,
      sql_text TEXT NOT NULL,
      parameters_json JSON,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

    // Consultas programadas
    await conn.query(`
    CREATE TABLE IF NOT EXISTS scheduled_queries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      template_id INT NOT NULL,
      cron_expression VARCHAR(100) NOT NULL,
      email_to VARCHAR(255) NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      last_run TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (template_id) REFERENCES query_templates(id)
    );
  `);

    // Resultados históricos
    await conn.query(`
    CREATE TABLE IF NOT EXISTS query_results (
      id INT AUTO_INCREMENT PRIMARY KEY,
      scheduled_query_id INT NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20),
      result_csv TEXT,
      error_message TEXT,
      FOREIGN KEY (scheduled_query_id) REFERENCES scheduled_queries(id)
    );
  `);

    console.log("✅ Tablas creadas");
    await conn.end();
}

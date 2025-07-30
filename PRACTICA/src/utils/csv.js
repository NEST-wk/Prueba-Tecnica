import { format } from 'fast-csv';
import { Readable } from 'stream';

/**
 * Convierte un array de objetos (filas SQL) en un Buffer CSV.
 * @param {Array<Object>} rows - resultado de una consulta SQL
 * @returns {Promise<Buffer>}
 */
export function generateCsvBuffer(rows) {
    return new Promise((resolve, reject) => {
        if (!rows || rows.length === 0) {
            return resolve(Buffer.from('No data'));
        }

        const stream = format({ headers: true });
        const readable = Readable.from(rows);

        const chunks = [];
        stream.on('data', chunk => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);

        readable.pipe(stream);
    });
}

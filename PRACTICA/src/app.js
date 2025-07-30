import express from 'express';
import dotenv from 'dotenv';
import { initDb } from './config/initDb.js';
import usersRoutes from './routes/users.js';
import templatesRoutes from './routes/templates.js';
import scheduledRoutes from './routes/scheduled.js';
import { loadScheduledJobs } from './jobs/cronRunner.js';



dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

await initDb();
await loadScheduledJobs();

app.use('/users', usersRoutes);
app.use('/templates', templatesRoutes);
app.use('/scheduled', scheduledRoutes);

app.listen(port, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${port}`);
});

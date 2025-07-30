import express from 'express';
import {
    createScheduledQuery,
    getScheduledQueries,
    getScheduledQueryById,
    deleteScheduledQuery
} from '../controllers/scheduled.js';

const router = express.Router();

router.post('/', createScheduledQuery);
router.get('/', getScheduledQueries);
router.get('/:id', getScheduledQueryById);
router.delete('/:id', deleteScheduledQuery);

export default router;

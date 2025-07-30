import express from 'express';
import {
    createTemplate,
    getTemplates,
    getTemplateById,
    deleteTemplate
} from '../controllers/templates.js';

const router = express.Router();

router.post('/', createTemplate);
router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.delete('/:id', deleteTemplate);

export default router;

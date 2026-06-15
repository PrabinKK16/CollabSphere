import express from 'express';
const router = express.Router();
import { globalSearch } from '../controllers/search.controller.js';
import { protect } from '../middlewares/auth.js';
router.use(protect);
router.get('/', globalSearch);
export default router;

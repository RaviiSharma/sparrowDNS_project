import express from 'express';
import { userRegistration } from '../controllers/userController.js';

const router = express.Router();

router.post('/register', userRegistration);

export default router;

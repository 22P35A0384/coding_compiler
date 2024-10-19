// routes/contests.js
import { Router } from 'express';
const router = Router();
import Newcontest from '../controlers/newcontest.js';

// Create a new contest
router.post('/newcontest',Newcontest );

export default router;

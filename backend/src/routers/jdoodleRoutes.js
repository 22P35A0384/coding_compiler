 // jdoodleRoutes.js
import express from 'express';
import { executeSqlCode } from '../controlers/jdoodleController.js';

const router = express.Router();

// Define the route for executing SQL code
router.post('/execute', executeSqlCode);

export default router;

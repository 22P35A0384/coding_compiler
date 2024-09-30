import express from 'express';
import executeSQLQuery from '../../controlers/problem_compiler/sql_compiler.js';

const router = express.Router();

// Route to execute SQL query
router.post('/problemcompiler/sql', executeSQLQuery);

export default router;

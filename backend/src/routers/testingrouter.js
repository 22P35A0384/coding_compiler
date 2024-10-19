import { Router } from 'express';
import checkInstallations from "../controlers/testing.js";

const router = Router();

router.get('/check-installations', checkInstallations);

export default router;

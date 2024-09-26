import Getcontests from "../controlers/getallcontests.js";
import { Router } from "express";

const router = Router()

router.get('/getcontests', Getcontests);

export default router;
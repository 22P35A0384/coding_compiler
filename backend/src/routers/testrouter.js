import Test from "../controlers/test.js";
import express from 'express';

const Router = express.Router()

Router.get('/test/:id',Test);

export default Router;
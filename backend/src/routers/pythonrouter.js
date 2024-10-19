import Python from "../controlers/python.js";
import express from 'express'

const Router = express.Router();

Router.post('/python', Python);

export default Router;
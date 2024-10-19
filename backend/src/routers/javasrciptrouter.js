import JavaScript from "../controlers/javascript.js";
import express from "express";

const Router = express.Router()

Router.post('/javascript',JavaScript);

export default Router;
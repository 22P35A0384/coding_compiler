import express from "express";
const Router = express.Router();
import Addproblem from "../controlers/addproblem.js";
// POST route to handle problem creation
Router.post('/addproblem', Addproblem);

export default Router;

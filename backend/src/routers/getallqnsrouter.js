import Getallqns from "../controlers/getallqns.js";
import express from "express";

const Router = express.Router();

Router.post('/allqns', Getallqns);

export default Router;
import compileAndRunC from "../controlers/c.js";
import express from "express";

const Router = express.Router();

Router.post("/c",compileAndRunC);

export default Router;
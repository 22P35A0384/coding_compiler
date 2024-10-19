import compileAndRunCpp from "../controlers/cpp.js";
import express from "express";

const Router = express.Router();

Router.post("/cpp",compileAndRunCpp);


export default Router;
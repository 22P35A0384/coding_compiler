import express from "express";
import compileC from "../../controlers/problem_compiler/c_compiler.js";


const Router = express.Router();

Router.post("/problemcompiler/c",compileC);

export default Router;
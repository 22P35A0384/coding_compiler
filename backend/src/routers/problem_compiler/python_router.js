import express from "express";
import compilePython from "../../controlers/problem_compiler/python_compiler.js";

const Router = express.Router();

Router.post("/problemcompiler/python",compilePython);

export default Router;
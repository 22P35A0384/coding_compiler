import express from "express";
import compileJava from "../../controlers/problem_compiler/java_compiler.js";


const Router = express.Router();

Router.post("/problemcompiler/java",compileJava);

export default Router;
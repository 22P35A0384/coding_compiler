import express from "express";
import compileJavaScript from "../../controlers/problem_compiler/js_compiler.js";

const Router = express.Router();

Router.post("/problemcompiler/javascript",compileJavaScript);

export default Router;
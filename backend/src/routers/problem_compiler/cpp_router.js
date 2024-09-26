import express from "express";
import compileCpp from "../../controlers/problem_compiler/cpp_compiler.js";

const Router = express.Router();

Router.post("/problemcompiler/cpp",compileCpp);

export default Router;
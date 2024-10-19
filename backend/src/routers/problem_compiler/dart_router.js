import express from "express";
import compileDart from "../../controlers/problem_compiler/dart_compiler.js";

const Router = express.Router();

Router.post("/problemcompiler/dart",compileDart);

export default Router;
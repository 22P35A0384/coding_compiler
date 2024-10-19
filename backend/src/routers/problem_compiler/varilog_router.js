import express from "express";
import compileVerilog from "../../controlers/problem_compiler/varilog_compiler.js";

const Router = express.Router();

Router.post("/problemcompiler/verilog", compileVerilog);

export default Router;

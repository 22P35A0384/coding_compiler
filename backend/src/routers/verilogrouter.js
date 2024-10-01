import express from "express";
import Verilogcompiler from "../controlers/verilog.js";

const Router = express.Router();

Router.post("/verilog", Verilogcompiler);

export default Router;

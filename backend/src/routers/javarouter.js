import Java from "../controlers/java.js";
import express from "express";

const Router = express.Router();

Router.post("/java",Java);

export default Router;
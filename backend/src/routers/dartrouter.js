import Dart from "../controlers/dart.js";
import express from "express";

const Router = express.Router()

Router.post('/dart',Dart);

export default Router;
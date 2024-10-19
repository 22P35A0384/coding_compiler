import express from "express";
import Newuser from "../controlers/newuser.js";
const Router = express.Router()

Router.post('/newuser',Newuser);

export default Router;
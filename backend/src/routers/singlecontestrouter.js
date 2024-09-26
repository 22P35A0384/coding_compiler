import Singlecontest from "../controlers/singlecontest.js";
import express from 'express'

const Router = express.Router()

Router.get('/contest/:id',Singlecontest);

export default Router;
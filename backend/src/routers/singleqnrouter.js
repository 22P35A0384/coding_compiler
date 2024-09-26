import Singleqn from '../controlers/singleqn.js';
import express from 'express'

const Router = express.Router()

Router.get('/question/:id',Singleqn);

export default Router;
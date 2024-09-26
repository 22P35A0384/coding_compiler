import Login from '../controlers/login.js';
import express from 'express';

const Router = express.Router()

Router.post('/login',Login);

export default Router;
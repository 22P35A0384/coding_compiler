import Otp from '../controlers/otp.js';
import express from 'express'

const Router = express.Router()

Router.post('/otp',Otp);

export default Router;
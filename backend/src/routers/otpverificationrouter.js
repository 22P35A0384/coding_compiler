import Otpverification from '../controlers/otpverification.js';
import express from 'express';

const Router = express.Router()

Router.post('/verifyotp',Otpverification);

export default Router;
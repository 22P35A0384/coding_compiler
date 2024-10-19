import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import { onRequest } from 'firebase-functions/v2/https';


// function imports
import Testingapi from "./src/routers/testingrouter.js";
import Testing from "./src/routers/testrouter.js";
import Addproblemapi from "./src/routers/addproblemrouter.js";
import Getallqnsapi from "./src/routers/getallqnsrouter.js";
import Newcontestapi from "./src/routers/contestrouter.js";
import Getcontestsapi from "./src/routers/getallcontestsrouter.js";
import Singlecontestapi from "./src/routers/singlecontestrouter.js";
import Singlequestionapi from "./src/routers/singleqnrouter.js";
import Otpapi from "./src/routers/otprouter.js";
import Otpverificationapi from "./src/routers/otpverificationrouter.js";
import Newuserapi from "./src/routers/newuserrouter.js";
import Loginapi from "./src/routers/loginrouter.js";

// Language API's
import Pythonapi from "./src/routers/pythonrouter.js";
import Javascriptapi from "./src/routers/javasrciptrouter.js";
import Capi from "./src/routers/crouter.js";
import Cppapi from "./src/routers/cpprouter.js";
import Javaapi from "./src/routers/javarouter.js";
import Dartapi from "./src/routers/dartrouter.js";
import Verilogapi from "./src/routers/verilogrouter.js"
import PythonProblemCompiler from "./src/routers/problem_compiler/python_router.js";
import CProblemCompiler from "./src/routers/problem_compiler/c_router.js";
import JavaProblemCompiler from "./src/routers/problem_compiler/java_router.js";
import DartProblemCompiler from "./src/routers/problem_compiler/dart_router.js";
import JsProblemCompiler from "./src/routers/problem_compiler/js_router.js";
import CppProblemCompiler from "./src/routers/problem_compiler/cpp_router.js";
import VerilogProblemCompiler from "./src/routers/problem_compiler/varilog_router.js";
import SqlProblemCompiler from "./src/routers/problem_compiler/sql_router.js";
import jdoodleRoutes from "./src/routers/jdoodleRoutes.js";


const app = express();

// app.use(bodyParser.json());
// Increase the limit for JSON payloads
app.use(bodyParser.json({ limit: '50mb' })); // Set the limit to 10 MB
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true })); // For URL-encoded data if necessary

app.use(cors());
const port = 5000;
mongoose.connect('mongodb+srv://admin:cLBG7LhkqX7orsSy@tally-codebrewers.d2lej.mongodb.net/tally-codebrewers?retryWrites=true&w=majority&appName=Tally-CodeBrewers')
    .then(()=>app.listen(port))
    .then(()=>console.log(`Server Running on ${port} && Database Connected Sucessfully :)`))
    .catch((err)=>console.log(err))


// Producction Functions

app.use('/',Testing);
app.use('/',Pythonapi);
app.use('/',Javascriptapi);
app.use('/',Addproblemapi);
app.use('/',Getallqnsapi);
app.use('/',Newcontestapi);
app.use('/',Getcontestsapi);
app.use('/',Singlecontestapi);
app.use('/',Singlequestionapi);
app.use('/',Capi);
app.use('/',Cppapi);
app.use('/',Javaapi);
app.use('/',Dartapi);
app.use('/',Testingapi);
app.use('/',PythonProblemCompiler);
app.use('/',CProblemCompiler);
app.use('/',JavaProblemCompiler);
app.use('/',DartProblemCompiler);
app.use('/',JsProblemCompiler);
app.use('/',CppProblemCompiler);
app.use('/',Otpapi);
app.use('/',Otpverificationapi);
app.use('/',Newuserapi);
app.use('/',Loginapi);
app.use('/',VerilogProblemCompiler);
app.use('/',SqlProblemCompiler);
app.use('/',Verilogapi);
app.use('/api/jdoodle',jdoodleRoutes);


// Testing Space

app.use("/api", (req, res, next)=>{
    res.send("Compiler Backend V0.01.15")
})


// firebase hosting export
export const api = onRequest(app);
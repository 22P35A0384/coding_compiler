// // server.js
// const express = require('express');
// const bodyParser = require('body-parser');
// const { exec } = require('child_process');

// const app = express();
// app.use(bodyParser.json());

// app.post('/execute-python', (req, res) => {
//     const { code, input } = req.body;

//     // Pass input to Python script via stdin
//     const pythonProcess = exec('python -c ' + JSON.stringify(code), { input });

//     let output = '';
//     let error = '';

//     pythonProcess.stdout.on('data', (data) => {
//         output += data;
//     });

//     pythonProcess.stderr.on('data', (data) => {
//         error += data;
//     });

//     pythonProcess.on('close', (code) => {
//         if (code !== 0) {
//             return res.status(500).json({ error });
//         }
//         res.json({ output });
//     });
// });

// app.listen(3001, () => {
//     console.log('Python execution backend running on port 3001');
// });
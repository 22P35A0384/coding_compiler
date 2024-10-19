import fs from 'fs';

import path from 'path';

import { spawn } from 'child_process';


const compileAndRunC = (req, res) => {

 const { code, input } = req.body;



 // Define file paths in the /tmp directory for safe temporary storage

 const codeFilePath = path.join('/tmp', 'TemporaryProgram.c');

 const executableFilePath = path.join('/tmp', 'TemporaryProgram');



 // Save the C code to a file

 fs.writeFileSync(codeFilePath, code);



 // Compile the C code using gcc

 const compileProcess = spawn('gcc', [codeFilePath, '-o', executableFilePath]);



 let compileOutput = '';

 let compileError = '';

 let responded = false; // Flag to check if response has been sent

 const timeout = 20000; // Increased timeout duration in milliseconds (20 seconds)



 // Set a timeout to kill the process if it runs too long

 const timer = setTimeout(() => {

  if (!responded) {

   compileProcess.kill('SIGTERM'); // Terminate the process

   res.status(500).json({ error: 'Compilation timeout', output: compileOutput });

   responded = true;

  }

 }, timeout);



 // Collect standard output and error from the compile process

 compileProcess.stdout.on('data', (data) => {

  compileOutput += data.toString(); // Collect output data

 });



 compileProcess.stderr.on('data', (data) => {

  compileError += data.toString(); // Collect error data

 });



 compileProcess.on('close', (code) => {

  clearTimeout(timer); // Clear the timeout if process completes

  if (!responded) {

   if (code !== 0) {

    res.status(500).json({ error: compileError, output: compileOutput });

    return;

   }



   // Run the compiled executable

   const runProcess = spawn(executableFilePath);



   let runOutput = '';

   let runError = '';



   // Check if input is provided and write input if necessary

   if (input) {

    try {

     runProcess.stdin.write(input); // Send input to the program

     runProcess.stdin.end();

    } catch (err) {

     console.error('Error writing to stdin:', err.message); // Log the error

     if (!responded) {

      res.status(500).json({ error: 'Error writing to stdin: ' + err.message });

      responded = true;

     }

    }

   }



   runProcess.stdout.on('data', (data) => {

    runOutput += data.toString(); // Collect output data

   });



   runProcess.stderr.on('data', (data) => {

    runError += data.toString(); // Collect error data

   });



   runProcess.on('close', (code) => {

    if (!responded) {

     if (code !== 0) {

      res.status(500).json({ error: runError, output: runOutput });

     } else {

      res.json({ output: runOutput });

     }

     responded = true;

    }

   });



   // Handle stdin errors (EPIPE or other write errors)

   runProcess.stdin.on('error', (err) => {

    console.error('Error writing to stdin:', err.message); // Log the error

    if (!responded) {

     res.status(500).json({ error: 'Error writing to stdin: ' + err.message });

     responded = true;

    }

   });



   // Handle other runtime errors

   runProcess.on('error', (err) => {

    if (!responded) {

     res.status(500).json({ error: err.message });

     responded = true;

    }

   });

  }

 });



 compileProcess.on('error', (err) => {

  clearTimeout(timer); // Clear the timeout on error

  if (!responded) {

   res.status(500).json({ error: err.message });

   responded = true;

  }

 });

};



export default compileAndRunC;

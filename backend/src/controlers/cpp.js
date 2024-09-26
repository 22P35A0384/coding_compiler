import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compileAndRunCpp = (req, res) => {
    const { code, input } = req.body;
    const filePath = path.join(__dirname, 'temp.cpp');
    const executablePath = path.join(__dirname, 'temp');

    // Write the C++ code to a temporary file
    fs.writeFileSync(filePath, code);

    // Compile the C++ code
    const compileProcess = spawn('g++', [filePath, '-o', executablePath]);

    let error = '';
    let output = '';
    let responded = false;
    const timeout = 10000;

    compileProcess.stderr.on('data', (data) => {
        error += data.toString();
    });

    compileProcess.on('close', (code) => {
        if (code !== 0) {
            if (!responded) {
                res.status(200).json({ error });
                responded = true;
            }
            return;
        }

        // Run the compiled executable
        const runProcess = spawn(executablePath);

        // Send the input to the C++ process
        runProcess.stdin.write(input);
        runProcess.stdin.end();

        // Set a timeout to kill the process if it runs too long
        const timer = setTimeout(() => {
            if (!responded) {
                runProcess.kill('SIGTERM');
                res.status(200).json({ error: 'Execution timeout', output });
                responded = true;
            }
        }, timeout);

        runProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        runProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        runProcess.on('close', (code) => {
            clearTimeout(timer);
            if (!responded) {
                if (code !== 0) {
                    res.status(200).json({ error, output });
                } else {
                    res.json({ output });
                }
                responded = true;
            }
        });

        runProcess.on('error', (err) => {
            clearTimeout(timer);
            if (!responded) {
                res.status(500).json({ error: err.message });
                responded = true;
            }
        });
    });

    compileProcess.on('error', (err) => {
        if (!responded) {
            res.status(500).json({ error: err.message });
            responded = true;
        }
    });
};

export default compileAndRunCpp;

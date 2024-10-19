import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Dart = (req, res) => {
    const { code, input } = req.body;

    // Define the file path
    const filePath = path.join(__dirname, 'TemporaryDartProgram.dart');

    // Save the Dart code to a file
    fs.writeFileSync(filePath, code);

    // Create a Dart process using spawn
    const dartProcess = spawn('dart', ['run', filePath]);

    let output = '';
    let error = '';
    let responded = false; // Flag to check if response has been sent
    const timeout = 10000; // Timeout duration in milliseconds (e.g., 10 seconds)

    // Set a timeout to kill the process if it runs too long
    const timer = setTimeout(() => {
        if (!responded) {
            dartProcess.kill('SIGTERM'); // Terminate the process
            // Send the output captured before killing
            res.status(200).json({ error: 'Execution timeout', output });
            responded = true;
        }
    }, timeout);

    // Send the input to the Dart process
    dartProcess.stdin.write(input);
    dartProcess.stdin.end();

    dartProcess.stdout.on('data', (data) => {
        output += data.toString(); // Collect output data
    });

    dartProcess.stderr.on('data', (data) => {
        error += data.toString(); // Collect error data
    });

    dartProcess.on('close', (code) => {
        clearTimeout(timer); // Clear the timeout if process completes
        if (!responded) {
            if (code !== 0) {
                res.status(200).json({ error, output });
            } else {
                res.json({ output });
            }
            responded = true;
        }
    });

    dartProcess.on('error', (err) => {
        clearTimeout(timer); // Clear the timeout on error
        if (!responded) {
            res.status(500).json({ error: err.message });
            responded = true;
        }
    });
}

export default Dart;

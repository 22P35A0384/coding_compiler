import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to extract the class name from the Java code
const extractClassName = (code) => {
    const match = code.match(/public\s+class\s+(\w+)/);
    return match ? match[1] : 'TemporaryJavaProgram';
};

const Java = (req, res) => {
    const { code, input } = req.body;

    // Extract the class name from the code
    const className = extractClassName(code);
    const filePath = path.join(__dirname, `${className}.java`);
    const classFilePath = path.join(__dirname, `${className}.class`);

    // Save the Java code to a file
    fs.writeFileSync(filePath, code);

    // Compile the Java code
    const javacProcess = spawn('javac', [filePath], { cwd: __dirname });

    let error = '';
    let responded = false; // Flag to check if response has been sent
    const timeout = 10000; // Timeout duration in milliseconds (e.g., 10 seconds)

    // Set a timeout to kill the process if it runs too long
    const timer = setTimeout(() => {
        if (!responded) {
            javacProcess.kill('SIGTERM'); // Terminate the process
            res.status(200).json({ error: 'Execution timeout' });
            responded = true;
        }
    }, timeout);

    javacProcess.stderr.on('data', (data) => {
        error += data.toString(); // Collect error data
    });

    javacProcess.on('close', (code) => {
        if (code === 0) {
            // Run the compiled Java code
            const javaProcess = spawn('java', [className], { cwd: __dirname });

            let output = '';
            javaProcess.stdin.write(input);
            javaProcess.stdin.end();

            javaProcess.stdout.on('data', (data) => {
                output += data.toString(); // Collect output data
            });

            javaProcess.stderr.on('data', (data) => {
                error += data.toString(); // Collect error data
            });

            javaProcess.on('close', (code) => {
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

            javaProcess.on('error', (err) => {
                clearTimeout(timer); // Clear the timeout on error
                if (!responded) {
                    res.status(200).json({ error: err.message });
                    responded = true;
                }
            });
        } else {
            clearTimeout(timer); // Clear the timeout if process fails
            if (!responded) {
                res.status(200).json({ error });
                responded = true;
            }
        }
    });

    javacProcess.on('error', (err) => {
        clearTimeout(timer); // Clear the timeout on error
        if (!responded) {
            res.status(200).json({ error: err.message });
            responded = true;
        }
    });
}

export default Java;

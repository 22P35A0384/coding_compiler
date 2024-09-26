import { spawn } from 'child_process';

const Python = (req, res) => {
    const { code, input } = req.body;

    // Create a Python process using spawn
    const pythonProcess = spawn('python3', ['-c', code]);

    let output = '';
    let error = '';
    let responded = false; // Flag to check if response has been sent
    const timeout = 10000; // Timeout duration in milliseconds (e.g., 10 seconds)

    // Send the input to the Python process
    pythonProcess.stdin.write(input);
    pythonProcess.stdin.end();

    // Set a timeout to kill the process if it runs too long
    const timer = setTimeout(() => {
        if (!responded) {
            pythonProcess.kill('SIGTERM'); // Terminate the process
            // Send the output captured before killing
            res.status(200).json({ error: 'Execution timeout', output });
            responded = true;
        }
    }, timeout);

    pythonProcess.stdout.on('data', (data) => {
        output += data.toString(); // Collect output data
    });

    pythonProcess.stderr.on('data', (data) => {
        error += data.toString(); // Collect error data
    });

    pythonProcess.on('close', (code) => {
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

    pythonProcess.on('error', (err) => {
        clearTimeout(timer); // Clear the timeout on error
        if (!responded) {
            res.status(500).json({ error: err.message });
            responded = true;
        }
    });
}

export default Python;

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Verilogcompiler = async (req, res) => {
    const { code, input,userName } = req.body; // Get Verilog code and custom input from the request
    console.log(userName);
    try {
         // Create unique file names based on the userName
         const filePath = path.join(__dirname, `${userName}_code.v`); // Save Verilog code as <userName>_code.v
         const compiledFilePath = path.join(__dirname, `${userName}_out.vvp`);
         const inputFilePath = path.join(__dirname, `${userName}_input.txt`); // Path for the input file

        // Save the Verilog code to a file
        fs.writeFileSync(filePath, code);

        // Save the custom input to a .txt file
        fs.writeFileSync(inputFilePath, input);

        // Compile the Verilog code
        const iverilogProcess = spawn('iverilog', ['-o', compiledFilePath, filePath], { cwd: __dirname });

        let error = '';
        let responded = false;
        const timeout = 20000; // 20-second timeout for compilation

        // Set a timeout to kill the process if it runs too long
        const timer = setTimeout(() => {
            if (!responded) {
                iverilogProcess.kill('SIGTERM'); // Terminate the process
                res.status(200).json({ error: 'Compilation timeout' });
                responded = true;
            }
        }, timeout);

        // Capture compilation errors (stderr)
        iverilogProcess.stderr.on('data', (data) => {
            error += data.toString(); // Collect error data
        });

        iverilogProcess.on('close', (code) => {
            clearTimeout(timer); // Clear timeout if process completes
            if (code === 0) {
                // Compilation succeeded, now simulate the code using vvp
                const vvpProcess = spawn('vvp', [compiledFilePath, '-f', inputFilePath], { cwd: __dirname });

                let output = '';

                // Capture simulation output (stdout)
                vvpProcess.stdout.on('data', (data) => {
                    output += data.toString(); // Collect simulation output
                });

                // Capture simulation errors (stderr)
                vvpProcess.stderr.on('data', (data) => {
                    error += data.toString(); // Collect error data
                });

                vvpProcess.on('close', (vvpCode) => {
                    // Cleanup and respond based on simulation success
                    cleanupFiles(filePath, compiledFilePath, inputFilePath);
                    if (vvpCode === 0) {
                        output = sanitizeOutput(output, filePath);
                        res.status(200).json({ message: 'Simulation successful', output });
                    } else {
                        error = sanitizeOutput(error, filePath);
                        res.status(200).json({ error });
                    }
                });

                vvpProcess.on('error', (err) => {
                    cleanupFiles(filePath, compiledFilePath, inputFilePath);
                    if (!responded) {
                        res.status(200).json({ error: err.message });
                        responded = true;
                    }
                });

            } else {
                // Compilation failed, sanitize the error before returning it
                error = sanitizeOutput(error, filePath);
                cleanupFiles(filePath, compiledFilePath, inputFilePath);
                if (!responded) {
                    res.status(200).json({ error });
                    responded = true;
                }
            }
        });

        iverilogProcess.on('error', (err) => {
            clearTimeout(timer); // Clear the timeout on error
            cleanupFiles(filePath, compiledFilePath, inputFilePath);
            if (!responded) {
                res.status(200).json({ error: err.message });
                responded = true;
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

// Function to sanitize output and remove sensitive file paths
function sanitizeOutput(output, filePath) {
    const fileName = 'Verilog Compiler ';
    const sanitizedOutput = output.replace(new RegExp(filePath, 'g'), fileName);
    return sanitizedOutput;
}

// Function to cleanup temporary files
function cleanupFiles(...filePaths) {
    filePaths.forEach(filePath => {
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Delete the file if it exists
            }
        } catch (cleanupError) {
            console.error('Error cleaning up files:', cleanupError.message);
        }
    });
}

export default Verilogcompiler;

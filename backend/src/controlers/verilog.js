import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Verilogcompiler = async (req, res) => {
    const { code } = req.body; // Verilog code from the request
    console.log(code);
    
    try {
        const filePath = path.join(__dirname, 'temp_code.v'); // Save Verilog code as temp_code.v
        const compiledFilePath = path.join(__dirname, 'temp_out.vvp');

        // Save the Verilog code to a file
        fs.writeFileSync(filePath, code);

        // Compile the Verilog code
        const iverilogProcess = spawn('iverilog', ['-o', compiledFilePath, filePath], { cwd: __dirname });

        let error = '';
        let responded = false;
        const timeout = 60000; // 60-second timeout for compilation

        // Set a timeout to kill the process if it runs too long
        const timer = setTimeout(() => {
            if (!responded) {
                iverilogProcess.kill('SIGTERM'); // Terminate the process
                res.status(500).json({ error: 'Compilation timeout' });
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
                const vvpProcess = spawn('vvp', [compiledFilePath], { cwd: __dirname });

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
                    if (vvpCode === 0) {
                        // Simulation succeeded, return output
                        res.status(200).json({ message: 'Simulation successful', output });
                    } else {
                        // Simulation failed, return error
                        if (!responded) {
                            res.status(500).json({ error });
                            responded = true;
                        }
                    }

                    // Cleanup files
                    try {
                        fs.unlinkSync(filePath);
                        fs.unlinkSync(compiledFilePath);
                    } catch (cleanupError) {
                        console.error('Error cleaning up files:', cleanupError.message);
                    }
                });

                vvpProcess.on('error', (err) => {
                    if (!responded) {
                        res.status(500).json({ error: err.message });
                        responded = true;
                    }
                });

            } else {
                // Compilation failed, return error
                if (!responded) {
                    res.status(500).json({ error });
                    responded = true;
                }

                // Cleanup files after compilation failure
                try {
                    fs.unlinkSync(filePath);
                    fs.unlinkSync(compiledFilePath);
                } catch (cleanupError) {
                    console.error('Error cleaning up files:', cleanupError.message);
                }
            }
        });

        iverilogProcess.on('error', (err) => {
            clearTimeout(timer); // Clear the timeout on error
            if (!responded) {
                res.status(500).json({ error: err.message });
                responded = true;
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error', message: err.message });
    }
};

export default Verilogcompiler;

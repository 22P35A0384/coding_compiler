import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Verilogcompiler = async (req, res) => {
    const { code } = req.body; // Removed unnecessary fields

    try {
        const filePath = path.join(__dirname, `temp_code.v`); // Save Verilog code as temp_code.v
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

        iverilogProcess.stderr.on('data', (data) => {
            error += data.toString(); // Collect error data
        });

        iverilogProcess.on('close', (code) => {
            clearTimeout(timer); // Clear timeout if process completes
            if (code === 0) {
                // Compilation succeeded
                res.status(200).json({ message: 'Compilation successful' });
            } else {
                // Compilation failed
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

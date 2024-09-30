import { spawn } from 'child_process';
import Problem from "../../models/problem.js";
import User from "../../models/user.js"; // Import the User model
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to execute Verilog code for each test case
const executeVerilogTestCase = (input, expectedOutput, isHidden = false) => {
    return new Promise((resolve) => {
        const verilogProcess = spawn('vvp', ['temp_out.vvp'], { cwd: __dirname });

        let output = '';
        let error = '';
        let responded = false;
        const timeout = 20000; // 20-second timeout for each test case

        // Send input to the Verilog process
        verilogProcess.stdin.write(`${input}\n`); // Ensure input format matches expected format in Verilog
        verilogProcess.stdin.end();

        // Set a timeout to kill the process if it runs too long
        const timer = setTimeout(() => {
            if (!responded) {
                verilogProcess.kill('SIGTERM'); // Terminate the process
                resolve({
                    result: 'timeout',
                    error: 'Execution timeout',
                    isHidden,
                });
                responded = true;
            }
        }, timeout);

        verilogProcess.stdout.on('data', (data) => {
            output += data.toString(); // Collect output data
        });

        verilogProcess.stderr.on('data', (data) => {
            error += data.toString(); // Collect error data
        });

        verilogProcess.on('close', (code) => {
            clearTimeout(timer); // Clear timeout if process completes
            if (!responded) {
                const passed = output.trim() === expectedOutput;
                resolve({
                    result: code === 0 && !error ? (passed ? 'passed' : 'failed') : 'failed',
                    output: output.trim(),
                    error: error.trim(),
                    isHidden,
                });
                responded = true;
            }
        });

        verilogProcess.on('error', (err) => {
            clearTimeout(timer); // Clear the timeout on error
            if (!responded) {
                resolve({
                    result: 'error',
                    error: err.message,
                    isHidden,
                });
                responded = true;
            }
        });
    });
};

const compileVerilog = async (req, res) => {
    const { code, id, userName } = req.body; // Added userName to request

    try {
        // Fetch problem data by ID
        const ProblemData = await Problem.findById(id);

        const sampleTestCases = ProblemData.sampleInputs || [];
        const hiddenTestCases = ProblemData.hiddenTestCases || [];

        // Extract input/output for both sample and hidden test cases
        const sampleInputOutputList = sampleTestCases.map(({ input, output }) => ({ input, output }));
        const hiddenInputOutputList = hiddenTestCases.map(({ input, output }) => ({ input, output }));

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

        iverilogProcess.on('close', async (code) => {
            clearTimeout(timer); // Clear timeout if process completes
            if (code === 0) {
                // Execute sample test cases
                let results = [];
                for (let i = 0; i < sampleInputOutputList.length; i++) {
                    const { input, output: expectedOutput } = sampleInputOutputList[i];
                    const result = await executeVerilogTestCase(input, expectedOutput);
                    results.push({
                        input,
                        expectedOutput,
                        output: result.output,
                        result: result.result,
                        error: result.error || null,
                    });
                }

                // Execute hidden test cases but exclude their input/output from the response
                for (let i = 0; i < hiddenInputOutputList.length; i++) {
                    const { input, output: expectedOutput } = hiddenInputOutputList[i];
                    const result = await executeVerilogTestCase(input, expectedOutput, true);
                    results.push({
                        result: result.result,
                        error: result.error || null,
                        isHidden: true, // Mark as hidden test case
                    });
                }

                // Cleanup files
                try {
                    fs.unlinkSync(filePath);
                    fs.unlinkSync(compiledFilePath);
                } catch (cleanupError) {
                    console.error('Error cleaning up files:', cleanupError.message);
                }

                // Send the final response, excluding input/output for hidden test cases
                const filteredResults = results.map((testCase) => {
                    if (testCase.isHidden) {
                        return {
                            result: testCase.result,
                            error: testCase.error,
                            isHidden: testCase.isHidden,
                        };
                    }
                    return testCase;
                });

                // Check if all sample test cases passed
                const allPassed = results.every(test => test.result === 'passed');

                if (allPassed) {
                    // Fetch user data and update solved problems
                    const userData = await User.findOne({ username: userName });
                    const userId = userData._id.toString();
                    if (userData) {
                        await User.findByIdAndUpdate(userData._id, {
                            $addToSet: { solved_problems: id }, // Ensure no duplicate problem entries
                        });

                        // Optionally update the problem's solved users
                        await Problem.findByIdAndUpdate(id, {
                            $addToSet: { solved_users: { user_id: userId, code, language: "Verilog" } }, // Ensure no duplicate user entries
                        });
                    }
                }

                res.status(200).json({ testResults: filteredResults });
            } else {
                // Compilation failed
                clearTimeout(timer);
                if (!responded) {
                    res.status(500).json({ error });
                    responded = true;
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
        res.status(500).json({ error: 'Problem not found or server error', message: err.message });
    }
};

export default compileVerilog;

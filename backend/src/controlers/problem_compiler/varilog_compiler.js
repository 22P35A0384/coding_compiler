import { spawn } from 'child_process';
import Problem from "../../models/problem.js";
import User from "../../models/user.js"; // Import the User model
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compileVerilog = async (req, res) => {
    const { code, id, userName, input: userInput } = req.body; // Capture 'input' from the request body
    try {
        // Fetch problem data by ID
        const ProblemData = await Problem.findById(id);
        const sampleTestCases = ProblemData.sampleInputs || [];
        const hiddenTestCases = ProblemData.hiddenTestCases || [];

        // Create unique file names based on the userName
        const filePath = path.join(__dirname, `${userName}_code.v`); // Save Verilog code as <userName>_code.v
        const compiledFilePath = path.join(__dirname, `${userName}_out.vvp`);
        const inputFilePath = path.join(__dirname, `${userName}_input.txt`); // Path for the input file

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
                let results = [];
                
                // Check if user input is provided
                if (userInput) {
                    // If user input is provided, write it to the input file and execute
                    fs.writeFileSync(inputFilePath, userInput + '\n');
                    const result = await executeVerilogTestCase(userInput, null, false, compiledFilePath, inputFilePath);
                    results.push({
                        input: userInput,
                        output: result.output,
                        result: result.result,
                        error: result.error || null,
                    });
                } else {
                    // If no input is provided, process test cases
                    const executeSingleTestCase = async (input, expectedOutput, isHidden = false) => {
                        fs.writeFileSync(inputFilePath, input + '\n');
                        const result = await executeVerilogTestCase(input, expectedOutput, isHidden, compiledFilePath, inputFilePath);
                        return result;
                    };

                    // Process sample test cases
                    for (const { input, output: expectedOutput } of sampleTestCases) {
                        const result = await executeSingleTestCase(input, expectedOutput);
                        results.push({
                            input,
                            expectedOutput,
                            output: result.output,
                            result: result.result,
                            error: result.error || null,
                        });
                    }

                    // Process hidden test cases
                    for (const { input, output: expectedOutput } of hiddenTestCases) {
                        const result = await executeSingleTestCase(input, expectedOutput, true);
                        results.push({
                            result: result.result,
                            error: result.error || null,
                            isHidden: true, // Mark as hidden test case
                        });
                    }
                }

                // Cleanup files
                try {
                    cleanupFiles(filePath, compiledFilePath, inputFilePath); // Clean up all relevant files
                } catch (cleanupError) {
                    console.error('Error cleaning up files:', cleanupError.message);
                }

                // Send final response, excluding input/output for hidden test cases
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

                const allPassed = results.every(test => test.result === 'passed');

                if (allPassed && !userInput) {
                    // Fetch user data and update solved problems only if running test cases
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

// Function to execute Verilog code for each test case
const executeVerilogTestCase = (input, expectedOutput, isHidden, compiledFilePath, inputFilePath) => {
    return new Promise((resolve) => {
        const verilogProcess = spawn('vvp', [compiledFilePath, '-f', inputFilePath], { cwd: __dirname });

        let output = '';
        let error = '';
        let responded = false;
        const timeout = 20000; // 20-second timeout for each test case

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

export default compileVerilog;

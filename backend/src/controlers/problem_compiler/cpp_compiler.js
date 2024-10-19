import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Problem from "../../models/problem.js";
import User from "../../models/user.js"; // Ensure you import the User model

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The executeTestCase function remains unchanged
const executeTestCase = (code, input, expectedOutput, executablePath, isHidden = false) => {
    return new Promise((resolve) => {
        // Write the C++ code to a temporary file
        const filePath = path.join(__dirname, 'temp.cpp');
        fs.writeFileSync(filePath, code);

        // Compile the C++ code
        const compileProcess = spawn('g++', [filePath, '-o', executablePath]);

        let error = '';
        let output = '';
        let responded = false;
        const timeout = 20000; // 20-second timeout for each test case

        compileProcess.stderr.on('data', (data) => {
            error += data.toString();
        });

        compileProcess.on('close', (code) => {
            if (code !== 0) {
                if (!responded) {
                    resolve({
                        result: 'compile error',
                        error,
                        isHidden,
                    });
                    responded = true;
                }
                return;
            }

            // Run the compiled executable
            const runProcess = spawn(executablePath);

            // Only write to stdin if the code has input
            if (input) {
                runProcess.stdin.write(input + '\n'); // Ensure input has newline
                runProcess.stdin.end();
            }

            // Set a timeout to kill the process if it runs too long
            const timer = setTimeout(() => {
                if (!responded) {
                    runProcess.kill('SIGTERM');
                    resolve({
                        result: 'timeout',
                        error: 'Execution timeout',
                        output,
                        isHidden,
                    });
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
                    const passed = output.trim() === expectedOutput;
                    resolve({
                        result: passed ? 'passed' : 'failed',
                        output: output.trim(),
                        error: error.trim(),
                        isHidden,
                    });
                    responded = true;
                }
            });

            runProcess.on('error', (err) => {
                clearTimeout(timer);
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

        compileProcess.on('error', (err) => {
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


const compileCpp = async (req, res) => {
    const { code, id, userName } = req.body; // Added userName to request
    const executablePath = path.join(__dirname, 'temp');

    try {
        // Fetch problem data by ID
        const ProblemData = await Problem.findById(id);

        // Combine sampleInputs and hiddenTestCases into one array
        const sampleTestCases = ProblemData.sampleInputs; // Sample test cases
        const hiddenTestCases = ProblemData.hiddenTestCases; // Hidden test cases

        // Extract input/output for both sample and hidden test cases
        const sampleInputOutputList = sampleTestCases.map(({ input, output }) => ({ input, output }));
        const hiddenInputOutputList = hiddenTestCases.map(({ input, output }) => ({ input, output }));

        let results = [];

        // Execute sample test cases
        for (let i = 0; i < sampleInputOutputList.length; i++) {
            const { input, output: expectedOutput } = sampleInputOutputList[i];
            const result = await executeTestCase(code, input, expectedOutput, executablePath);
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
            const result = await executeTestCase(code, input, expectedOutput, executablePath, true);
            results.push({
                result: result.result,
                error: result.error || null,
                isHidden: true, // Mark as hidden test case
            });
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
                    $addToSet: { solved_users: { user_id: userId, code,language:"CPP" } }, // Ensure no duplicate user entries
                });
            }
        }

        res.status(200).json({ testResults: filteredResults });
    } catch (err) {
        res.status(500).json({ error: 'Problem not found or server error', message: err.message });
    }
};

export default compileCpp;

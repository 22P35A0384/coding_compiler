import { spawn } from 'child_process';
import Problem from "../../models/problem.js";
import User from '../../models/user.js';

const compilePython = async (req, res) => {
    const { code, id, userName } = req.body;

    try {
        // Fetch problem data by ID
        const ProblemData = await Problem.findById(id);

        // Combine sampleInputs and hiddenTestCases into one array
        const sampleTestCases = ProblemData.sampleInputs; // Sample test cases
        const hiddenTestCases = ProblemData.hiddenTestCases; // Hidden test cases

        // Extract input/output for both sample and hidden test cases
        const sampleInputOutputList = sampleTestCases.map(({ input, output }) => ({ input, output }));
        const hiddenInputOutputList = hiddenTestCases.map(({ input, output }) => ({ input, output }));

        let results = []; // To store results for each test case

        // Function to execute Python code for each test case
        const executeTestCase = (input, expectedOutput, isHidden = false) => {
            return new Promise((resolve) => {
                const pythonProcess = spawn('python3', ['-c', code]);

                let output = '';
                let error = '';
                let responded = false;
                const timeout = 20000; // 20-second timeout for each test case

                // Send input to the Python process
                pythonProcess.stdin.write(input);
                pythonProcess.stdin.end();

                // Set a timeout to kill the process if it runs too long
                const timer = setTimeout(() => {
                    if (!responded) {
                        pythonProcess.kill('SIGTERM'); // Terminate the process
                        resolve({
                            result: 'timeout',
                            error: 'Execution timeout',
                            isHidden,
                        });
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
                    clearTimeout(timer); // Clear timeout if process completes
                    if (!responded) {
                        if (code !== 0 || error) {
                            resolve({
                                result: 'failed',
                                output: output.trim(),
                                error: error.trim(),
                                isHidden,
                            });
                        } else {
                            const passed = output.trim() === expectedOutput;
                            resolve({
                                result: passed ? 'passed' : 'failed',
                                output: output.trim(),
                                isHidden,
                            });
                        }
                        responded = true;
                    }
                });

                pythonProcess.on('error', (err) => {
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

        // Execute sample test cases
        for (let i = 0; i < sampleInputOutputList.length; i++) {
            const { input, output: expectedOutput } = sampleInputOutputList[i];
            const result = await executeTestCase(input, expectedOutput);
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
            const result = await executeTestCase(input, expectedOutput, true);
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

        // Check if all test cases passed
        let passedCount = 0;
        for (let ele of filteredResults) {
            if (ele.result === "passed") {
                passedCount += 1;
            }
        }

        if (passedCount === 5) {
            // Fetch user data
            const userData = await User.findOne({ username: userName });
            const userId = userData._id.toString();

            // Update the user's solved_problems array
            await User.findByIdAndUpdate(userId, {
                $addToSet: { solved_problems: id }, // Ensure no duplicate problem entries
            });

            // Update the problem's solved_users array
            await Problem.findByIdAndUpdate(id, {
                $addToSet: { solved_users: { user_id: userId, code,language:"Python" } }, // Ensure no duplicate user entries
            });
        }

        res.status(200).json({ testResults: filteredResults });
    } catch (err) {
        res.status(500).json({ error: 'Problem not found or server error', message: err.message });
    }
};

export default compilePython;

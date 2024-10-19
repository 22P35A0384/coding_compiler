import { createContext, runInContext } from 'vm';
import Problem from "../../models/problem.js";

// Function to execute JavaScript code for each test case
const executeTestCase = (code, input, expectedOutput, isHidden = false) => {
    return new Promise((resolve) => {
        let output = '';
        let error = '';
        let responded = false;
        const timeout = 20000; // 20-second timeout for each test case

        // Create a new VM context with an overridden console
        const context = createContext({
            input,
            console: {
                log: (...args) => {
                    output += args.join(' ') + '\n';
                },
                error: (...args) => {
                    error += args.join(' ') + '\n';
                },
            },
        });

        // Set a timeout to kill the process if it runs too long
        const timer = setTimeout(() => {
            if (!responded) {
                resolve({
                    result: 'timeout',
                    error: 'Execution timeout',
                    isHidden,
                });
                responded = true;
            }
        }, timeout);

        try {
            // Run the JavaScript code in the VM context
            const result = runInContext(code, context, { timeout: 10000 });

            // If the code returns something, add it to the output
            if (result !== undefined) {
                output += result;
            }

            clearTimeout(timer); // Clear the timeout if process completes
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
        } catch (err) {
            clearTimeout(timer); // Clear the timeout on error
            if (!responded) {
                resolve({
                    result: 'error',
                    error: err.message,
                    isHidden,
                });
                responded = true;
            }
        }
    });
};

const compileJavaScript = async (req, res) => {
    const { code, id } = req.body;

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
            const result = await executeTestCase(code, input, expectedOutput);
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
            const result = await executeTestCase(code, input, expectedOutput, true);
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

        res.status(200).json({ testResults: filteredResults });
    } catch (err) {
        res.status(500).json({ error: 'Problem not found or server error', message: err.message });
    }
};

export default compileJavaScript;

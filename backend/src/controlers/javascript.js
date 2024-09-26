import { createContext, runInContext } from 'vm';

const JavaScript = (req, res) => {
  const { code, input } = req.body;
  console.log("Code:", code, "Input:", input);

  // Initialize a variable to capture the output
  let output = '';
  let error = '';

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

  try {
    // Run the JavaScript code in the VM context
    const result = runInContext(code, context, { timeout: 10000 });
    
    // If the code returns something, add it to the output
    if (result !== undefined) {
      output += result;
    }

    // Respond with the output or captured error
    res.json({ output: output.trim(), error: error.trim() });
  } catch (err) {
    // Catch and send any runtime errors
    error = err.message;
    res.status(500).json({ error });
  }
};

export default JavaScript;

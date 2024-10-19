// jdoodleController.js
import axios from 'axios';

export const executeSqlCode = async (req, res) => {
  const { script, language, versionIndex } = req.body;

//   // Validate input
//   if (!script || !language || typeof versionIndex !== 'number') {
//     return res.status(400).json({
//       success: false,
//       error: 'Invalid input',
//       message: 'Script, language, and versionIndex are required.',
//     });
//   }

  try {
    const response = await axios.post(`https://api.jdoodle.com/v1/execute`, {
      script,
      language,
      versionIndex,
      clientId: '9cb0e4a1d3f217117be9701917f9df09', // Use environment variables
      clientSecret: 'bdb021c8c5b05005cd43e0d259825f96c19c9684bc232fd486c5b8e79990d235',
    });

    const { success, data, output, error, isExecutionSuccess } = response.data || {};

    console.log('Request body:', req.body);
    console.log('Response data:', response.data);

    // Constructing the response
    if (isExecutionSuccess) {
      res.status(200).json({
        success: true,
        data: {
          output,
          memory: response.data.memory,
          cpuTime: response.data.cpuTime,
        },
      });
    } else {
      res.status(200).json({
        success: false,
        error: error || 'Execution failed.',
        message: 'An error occurred during execution.',
      });
    }
  } catch (err) {
    console.error('Error executing SQL code:', err.message);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: err.message,
    });
  }
};

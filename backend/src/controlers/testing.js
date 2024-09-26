import { exec } from 'child_process';

const checkInstallation = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
};

const checkInstallations = async (req, res) => {
  try {
    const javaInstalled = await checkInstallation('java -version');
    const pythonInstalled = await checkInstallation('python3 --version');
    const cInstalled = await checkInstallation('gcc --version');
    const cppInstalled = await checkInstallation('g++ --version');
    const dartInstalled = await checkInstallation('dart --version');

    res.json({
      java: javaInstalled,
      python: pythonInstalled,
      c: cInstalled,
      cpp: cppInstalled,
      dart: dartInstalled,
    });
  } catch (error) {
    res.status(500).send('An error occurred while checking installations');
  }
};

export default checkInstallations;

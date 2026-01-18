const { exec } = require('child_process');

module.exports = async () => {
  try {
    // Open the server URL in the default browser (Windows)
    exec('start http://localhost:5000');
  } catch (err) {
    console.error('Failed to open browser:', err);
  }
};

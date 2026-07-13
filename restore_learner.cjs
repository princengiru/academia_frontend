const { execSync } = require('child_process');

try {
    console.log('Restoring any missing files in learner directory from git...');
    // Restore the learner directory specifically
    execSync('git checkout -- "src/pages/academia/learner/"');
    console.log('Restore complete!');
} catch (err) {
    console.error('Failed to restore:', err.message);
}

// Delete this script
const fs = require('fs');
if (fs.existsSync(__filename)) {
    fs.unlinkSync(__filename);
}

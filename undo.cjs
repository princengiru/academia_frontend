const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const profDir = path.join(__dirname, 'src', 'pages', 'academia', 'professor');

// Files that were newly created and should be deleted
const filesToDelete = [
    'ProfessorsPageShell.jsx',
    'ProfilePhotoCropModal.jsx',
    'ProfilePhotoViewModal.css',
    'ProfilePhotoViewModal.jsx',
    'HoasButtonSpinner.jsx',
    'profilePhotoUtils.js',
    'professorProfileShared.js',
    'phoneCountries.js'
];

// Files that were overwritten and should be restored from git
const filesToRestore = [
    'account.jsx',
    'account.css',
    'Settings.jsx',
    'settings.css'
];

console.log('Undoing changes in professor directory...');

// Delete new files
filesToDelete.forEach(file => {
    const filePath = path.join(profDir, file);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Deleted ${file}`);
    }
});

// Restore overwritten files using git
filesToRestore.forEach(file => {
    const filePath = path.join(profDir, file);
    try {
        execSync(`git checkout "${filePath}"`);
        console.log(`Restored ${file} from git`);
    } catch (err) {
        console.error(`Failed to restore ${file} using git. Ensure your repository is intact.`, err.message);
    }
});

// Finally, clean up the script files we created in the root
const scriptsToDelete = ['copy_and_replace.js', 'copy_and_replace.cjs', 'undo.cjs'];
scriptsToDelete.forEach(script => {
    const scriptPath = path.join(__dirname, script);
    // We defer the deletion of undo.cjs until the very end, or let the user do it.
    // Actually, it's safer to just let the script delete itself at the end of execution (Windows allows this sometimes, but let's be careful).
    if (script !== 'undo.cjs' && fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
        console.log(`Deleted ${script}`);
    }
});

console.log('Undo complete!');

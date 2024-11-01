const { exec } = require('child_process');
const path = require('path');

console.log("Script finished executing.");

// Function to find Steam path from the Windows registry
function findDota2Path(callback) {
    // Run the registry query command for the SteamPath key
    exec('reg query HKCU\\Software\\Valve\\Steam /v SteamPath', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            callback(null);
            return;
        }
        if (stderr) {
            console.error(`Standard Error: ${stderr}`);
            callback(null);
            return;
        }

        // Parse the registry output to find the SteamPath
        const lines = stdout.split('\n');
        for (const line of lines) {
            if (line.includes('SteamPath')) {
                // Extract the path value and construct the Dota 2 path
                const steamPath = line.split('   ').pop().trim();
                const dota2Path = path.join(steamPath, 'steamapps', 'common', 'dota 2 beta', 'game', 'dota', 'cfg', 'gamestate_integration');

                // Print the found Dota 2 path
                console.log(`Dota 2 path found: ${dota2Path}`);
                callback(dota2Path);
                return;
            }
        }

        // If SteamPath wasn't found, notify that it wasn't found
        console.log('Dota 2 path not found. Please specify the installation path manually.');
        callback(null);
    });
}

// Usage of the findDota2Path function
findDota2Path((dota2Path) => {
    if (dota2Path) {
        console.log(`Final Dota 2 path is: ${dota2Path}`);
    } else {
        console.log('Unable to locate the Dota 2 path.');
    }
});

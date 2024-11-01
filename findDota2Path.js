const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Function to retrieve the Steam installation path from the registry
function getSteamPathFromRegistry() {
    return new Promise((resolve, reject) => {
        exec('reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\WOW6432Node\\Valve\\Steam" /v InstallPath', (err, stdout, stderr) => {
            if (err) {
                reject(`Error retrieving Steam path: ${stderr || err.message}`);
                return;
            }
            const match = stdout.match(/InstallPath\s+REG_SZ\s+(.+)/);
            if (match && match[1]) {
                resolve(match[1].trim());
            } else {
                reject("InstallPath not found in registry.");
            }
        });
    });
}

// Function to read the libraryfolders.vdf file and get the installation paths
function getLibraryFolders(steamPath) {
    return new Promise((resolve, reject) => {
        const libraryFilePath = path.join(steamPath, 'steamapps', 'libraryfolders.vdf');

        fs.readFile(libraryFilePath, 'utf8', (err, data) => {
            if (err) {
                reject(`Error reading libraryfolders.vdf: ${err.message}`);
                return;
            }

            const libraryPaths = [];
            const regex = /"path"\s+"([^"]+)"/g; // Regex to match paths correctly
            let match;

            while ((match = regex.exec(data)) !== null) {
                libraryPaths.push(match[1]); // Extract path
            }

            if (libraryPaths.length === 0) {
                console.log('No valid library paths found in libraryfolders.vdf.');
            }
            resolve(libraryPaths);
        });
    });
}

// Function to check for the Dota 2 installation
async function findDota2Path() {
    try {
        const steamPath = await getSteamPathFromRegistry();
        console.log(`Steam path found: ${steamPath}`);

        const libraryPaths = await getLibraryFolders(steamPath);
        console.log('Library paths found:', libraryPaths);

        let foundDota2Path = false;

        for (const libraryPath of libraryPaths) {
            // Check Dota 2 beta and standard installation paths
            const dotaBetaPath = path.join(libraryPath, 'steamapps', 'common', 'Dota 2 Beta', 'game', 'dota', 'cfg', 'gamestate_integration');
            const dotaPath = path.join(libraryPath, 'steamapps', 'common', 'Dota 2', 'game', 'dota', 'cfg', 'gamestate_integration');

            if (fs.existsSync(dotaBetaPath)) {
                console.log(`Dota 2 Beta path found: ${dotaBetaPath}`);
                foundDota2Path = true;
                break; // Exit loop if found
            }

            if (fs.existsSync(dotaPath)) {
                console.log(`Dota 2 path found: ${dotaPath}`);
                foundDota2Path = true;
                break; // Exit loop if found
            }
        }

        if (!foundDota2Path) {
            console.log('Dota 2 path not found. Please check the installation.');
        }
    } catch (error) {
        console.error(error);
    }
}

// Execute the function to find Dota 2 path
findDota2Path();

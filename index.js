import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import open from 'open'; // Correct ES module import
import d2gsi from 'dota2-gsi';
import sound from 'sound-play';
import settings from 'electron-settings';

const weeklyLinkURL = 'https://www.profitablecpmrate.com/w34v88kz?key=76854d5f9b02d46524ccf20cf1343a5c';



// #region My Region


// Function to check and create the configuration file
function checkAndCreateConfigFile(dotaPath) {
    const configFilePath = path.join(dotaPath, 'gamestate_integration_dota2-gsi.cfg');
    const configFileContent = `"dota2-gsi Configuration"
{
    "uri"               "http://localhost:3000/"
    "timeout"           "5.0"
    "buffer"            "0.1"
    "throttle"          "0.1"
    "heartbeat"         "30.0"
    "data"
    {
        "buildings"     "1"
        "provider"      "1"
        "map"           "1"
        "player"        "1"
        "hero"          "1"
        "abilities"     "1"
        "items"         "1"
        "draft"         "1"
        "wearables"     "1"
    }
    "auth"
    {
        "token"         "hello1234"
    }
}`;

    // Check if the config file exists
    if (fs.existsSync(configFilePath)) {
        console.log(`Configuration file already exists: ${configFilePath}`);
    } else {
        // Create the config file with the specified contents
        fs.writeFileSync(configFilePath, configFileContent.trim(), 'utf8');
        console.log(`Configuration file created: ${configFilePath}`);
    }
}

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
                checkAndCreateConfigFile(dotaBetaPath); // Corrected
                break; // Exit loop if found
            }

            if (fs.existsSync(dotaPath)) {
                console.log(`Dota 2 path found: ${dotaPath}`);
                foundDota2Path = true;
                checkAndCreateConfigFile(dotaPath); // Corrected
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

// #endregion

async function checkAndPromptWeeklyLink() {
    const lastClick = await settings.get('lastLinkClick');
    const currentTime = new Date().getTime();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;

    // Check if a week has passed since last click
    if (!lastClick || currentTime - lastClick > oneWeek) {
        // Prompt the user to click the link (via UI message or BrowserWindow)
        console.log('Please click the weekly link to continue using the software.');
    }
}

ipcMain.on('click-weekly-link', async (event) => {
    try {
        console.log('Button clicked, opening URL...');
        const currentCounter = await settings.get('clickCounter') || 0;

        // Open the link using the `open` function
        open('https://www.profitablecpmrate.com/w34v88kz?key=76854d5f9b02d46524ccf20cf1343a5c');

        await settings.set('lastLinkClick', new Date().getTime());
        await settings.set('clickCounter', currentCounter + 1);

        event.sender.send('update-click-status', currentCounter + 1);
    } catch (err) {
        console.error('Error opening link:', err);
    }
});

// Handle uncaught exceptions globally
process.on("uncaughtException", (error) => {
    if (error.code === "EADDRINUSE") {
        console.warn("Port 3000 is already in use. Suppressing the error and continuing...");
    } else {
        console.error("Uncaught Exception:", error);
    }
});

//--------------------------------------------------------------
let fountainPlayTimes = createPlayTimes(80, 90, 4580);
let filePlayTimes = createPlayTimes(390, 420, 21390);
let pullPlayTimes = createPlayTimes(98, 60, 6758);
let stackPlayTimes = createPlayTimes(47, 60, 5327);

// Function to create and populate play times based on start, interval, and end
function createPlayTimes(start, interval, end) {
    const playTimes = [];
    for (let i = start; i <= end; i += interval) {
        playTimes.push(i);
    }
    return playTimes;
}

// Current mode
let currentMode = 'turbo'; // Default to turbo

// IPC listener for starting sounds based on mode
ipcMain.on('start-sounds', (event, { mode }) => {
    console.log(`Switching to ${mode} mode.`);
    currentMode = mode;

    if (mode === 'ranked') {
        fountainPlayTimes = createPlayTimes(80, 180, 4580); // Change interval to 180
    } else {
        fountainPlayTimes = createPlayTimes(80, 90, 4580); // Default intervals for turbo
    }

    startSoundEvents(); // Start listening for Dota 2 events
});

// Global state for checkbox states
let soundEnabled = {
    fountain: true,
    wisdom: true,
    pull: true,
    stack: true,
};

// IPC listener for checkbox updates
ipcMain.on('update-checkboxes', (event, states) => {
    console.log('Checkbox states updated:', states);
    soundEnabled = states; // Update global state
});

// Updated sound event listener
function startSoundEvents() {
    console.log(`Starting sound event listener for ${currentMode} mode...`);
    const server = new d2gsi();

    server.events.on('newclient', (client) => {
        console.log('New client connected.');
        client.on('map:clock_time', (clock_time) => {
            console.log(`Clock Time: ${clock_time}`);
            if (soundEnabled.fountain && fountainPlayTimes.includes(clock_time)) {
                sound.play("F:\\Ilan\\DotaListener\\dota2-gsi\\file2.mp3");
            }
            if (soundEnabled.wisdom && filePlayTimes.includes(clock_time)) {
                sound.play("F:\\Ilan\\DotaListener\\dota2-gsi\\file.mp3");
            }
            if (soundEnabled.pull && pullPlayTimes.includes(clock_time)) {
                sound.play("F:\\Ilan\\DotaListener\\dota2-gsi\\pull.mp3");
            }
            if (soundEnabled.stack && stackPlayTimes.includes(clock_time)) {
                sound.play("F:\\Ilan\\DotaListener\\dota2-gsi\\stack.mp3");
            }
        });
    });
}


// Function to create the main application window
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            contextIsolation: false,
            enableRemoteModule: true,
            nodeIntegration: true,
        },
    });

    win.setMenu(null);
    win.loadFile('index.html');
}

// When the app is ready, create the main window
app.whenReady().then(() => {
    createWindow();
});

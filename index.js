const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const d2gsi = require('dota2-gsi');
const sound = require('sound-play');
const { exec } = require('child_process');
const fs = require('fs');

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


// Initialize arrays with default values
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

// IPC listener for saving intervals from the renderer process
ipcMain.on('save-intervals', (event, intervals) => {
    console.log('Saving intervals...');

    const newFountainTimes = createPlayTimes(intervals.fountain.start, intervals.fountain.interval, intervals.fountain.end);
    const newFileTimes = createPlayTimes(intervals.file.start, intervals.file.interval, intervals.file.end);
    const newPullTimes = createPlayTimes(intervals.pull.start, intervals.pull.interval, intervals.pull.end);
    const newStackTimes = createPlayTimes(intervals.stack.start, intervals.stack.interval, intervals.stack.end);

    if (JSON.stringify(newFountainTimes) !== JSON.stringify(fountainPlayTimes)) {
        fountainPlayTimes = newFountainTimes;
    }
    if (JSON.stringify(newFileTimes) !== JSON.stringify(filePlayTimes)) {
        filePlayTimes = newFileTimes;
    }
    if (JSON.stringify(newPullTimes) !== JSON.stringify(pullPlayTimes)) {
        pullPlayTimes = newPullTimes;
    }
    if (JSON.stringify(newStackTimes) !== JSON.stringify(stackPlayTimes)) {
        stackPlayTimes = newStackTimes;
    }

    console.log('Updated Fountain Play Times:', fountainPlayTimes);
    console.log('Updated File Play Times:', filePlayTimes);
    console.log('Updated Pull Play Times:', pullPlayTimes);
    console.log('Updated Stack Play Times:', stackPlayTimes);
});

// IPC listener for starting sounds
ipcMain.on('start-sounds', () => {
    console.log('Received request to start sounds.');
    startSoundEvents();
});

// Function to start listening for Dota 2 events and play sounds
function startSoundEvents() {
    console.log("Starting sound event listener...");
    const server = new d2gsi(); // Create a new instance of d2gsi

    server.events.on('newclient', (client) => {
        console.log("New client connected.");
        client.on('map:clock_time', (clock_time) => {
            console.log(`Clock Time: ${clock_time}`);
            if (fountainPlayTimes.includes(clock_time)) {
                sound.play("F:\\Ilan\\DotaListener\\dota2-gsi\\file2.mp3");
            }
            if (filePlayTimes.includes(clock_time)) {
                sound.play("F:\\Ilan\\DotaListener\\dota2-gsi\\file.mp3");
            }
            if (stackPlayTimes.includes(clock_time)) {
                sound.play("F:\\Ilan\\DotaListener\\dota2-gsi\\stack.mp3");
            }
            if (pullPlayTimes.includes(clock_time)) {
                sound.play("F:\\Ilan\\DotaListener\\dota2-gsi\\pull.mp3");
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
            contextIsolation: false, // Set to false to allow direct access to Node.js
            enableRemoteModule: true, // Enable remote module if needed
            nodeIntegration: true, // Enable Node.js integration
        },
    });

    win.loadFile('index.html'); // Load your HTML file
}



// When the app is ready, create the main window
app.whenReady().then(createWindow);

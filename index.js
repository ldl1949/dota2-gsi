const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const d2gsi = require('dota2-gsi');
const sound = require('sound-play');

let fountainPlayTimes = [];
let filePlayTimes = [];
let pullPlayTimes = [];
let stackPlayTimes = [];

// Function to create and populate play times for sounds
function createPlayTimes() {
    const fountainPlayTimes = [];
    const filePlayTimes = [];
    const pullPlayTimes = [];
    const stackPlayTimes = [];

    // Populate fountainPlayTimes
    for (let i = 80; i <= 4580; i += 90) {
        fountainPlayTimes.push(i);
    }
    console.log('Fountain Play Times:', fountainPlayTimes);

    // Populate filePlayTimes
    for (let i = 390; i <= 21390; i += 420) {
        filePlayTimes.push(i);
    }
    console.log('File Play Times:', filePlayTimes);

    // Populate pullPlayTimes
    for (let i = 98; i <= 6758; i += 60) {
        pullPlayTimes.push(i);
    }
    console.log('Pull Play Times:', pullPlayTimes);

    // Populate stackPlayTimes
    for (let i = 47; i <= 5327; i += 60) {
        stackPlayTimes.push(i);
    }
    console.log('Stack Play Times:', stackPlayTimes);

    return {
        fountainPlayTimes,
        filePlayTimes,
        pullPlayTimes,
        stackPlayTimes
    };
}

// Function to start listening for Dota 2 events and play sounds
function startSoundEvents() {
    const server = new d2gsi();

    server.events.on('newclient', function (client) {
        client.on('map:clock_time', function (clock_time) {
            // Play sounds based on the clock time and the populated play times
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

// Call createPlayTimes immediately on app start to populate lists and log them
const playTimes = createPlayTimes();

// IPC listener for starting sounds
ipcMain.on('start-sounds', () => {
    console.log('Starting sounds with predefined play times...');

    // Use the pre-populated playTimes lists
    fountainPlayTimes = playTimes.fountainPlayTimes; // Get fountain play times
    filePlayTimes = playTimes.filePlayTimes;         // Get file play times
    stackPlayTimes = playTimes.stackPlayTimes;       // Get stack play times
    pullPlayTimes = playTimes.pullPlayTimes;         // Get pull play times

    console.log('Fountain Play Times:', fountainPlayTimes); // Log the fountain play times
    console.log('File Play Times:', filePlayTimes);         // Log the file play times
    console.log('Stack Play Times:', stackPlayTimes);       // Log the stack play times
    console.log('Pull Play Times:', pullPlayTimes);         // Log the pull play times

    // Call the function to play sounds with the updated intervals
    startSoundEvents(); // Now this should work correctly
});

// Function to create the main application window
function createWindow() {
    const win = new BrowserWindow({
        width: 600,
        height: 400,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
}

// When the app is ready, create the main window
app.whenReady().then(createWindow);

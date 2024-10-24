const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const d2gsi = require('dota2-gsi');
const sound = require('sound-play');

// Initialize arrays with default values
let fountainPlayTimes = createPlayTimes(80, 90, 4580);
let filePlayTimes = createPlayTimes(390, 420, 21390);
let pullPlayTimes = createPlayTimes(98, 60, 6758);
let stackPlayTimes = createPlayTimes(47, 60, 5327);

// Function to create and populate play times based on start, interval, and end
function createPlayTimes(start, interval, end) {
    const playTimes = []; // Array to hold generated play times
    if (start < 0 || interval <= 0 || end < start) {
        console.error("Invalid parameters for play times."); // Log an error if parameters are invalid
        return playTimes; // Return an empty array if parameters are invalid
    }
    for (let i = start; i <= end; i += interval) {
        playTimes.push(i); // Add each generated time to the array
    }
    return playTimes; // Return the populated play times array
}

// IPC listener for saving intervals from the renderer process
ipcMain.on('save-intervals', (event, intervals) => {
    // Create play times based on user input only if they differ from defaults
    const newFountainTimes = createPlayTimes(intervals.fountain.start, intervals.fountain.interval, intervals.fountain.end);
    const newFileTimes = createPlayTimes(intervals.file.start, intervals.file.interval, intervals.file.end);
    const newPullTimes = createPlayTimes(intervals.pull.start, intervals.pull.interval, intervals.pull.end);
    const newStackTimes = createPlayTimes(intervals.stack.start, intervals.stack.interval, intervals.stack.end);

    // Only update if the new values are different from the current default values
    if (JSON.stringify(newFountainTimes) !== JSON.stringify(fountainPlayTimes)) {
        fountainPlayTimes = newFountainTimes; // Update fountain times if they are different
    }
    if (JSON.stringify(newFileTimes) !== JSON.stringify(filePlayTimes)) {
        filePlayTimes = newFileTimes; // Update file times if they are different
    }
    if (JSON.stringify(newPullTimes) !== JSON.stringify(pullPlayTimes)) {
        pullPlayTimes = newPullTimes; // Update pull times if they are different
    }
    if (JSON.stringify(newStackTimes) !== JSON.stringify(stackPlayTimes)) {
        stackPlayTimes = newStackTimes; // Update stack times if they are different
    }

    // Log the created play times to the console
    console.log('Fountain Play Times:', fountainPlayTimes);
    console.log('File Play Times:', filePlayTimes);
    console.log('Pull Play Times:', pullPlayTimes);
    console.log('Stack Play Times:', stackPlayTimes);
});

// Function to start listening for Dota 2 events and play sounds
function startSoundEvents() {
    const server = new d2gsi(); // Create a new instance of d2gsi

    // Listen for a new client connection
    server.events.on('newclient', function (client) {
        // Listen for clock time events from the Dota 2 client
        client.on('map:clock_time', function (clock_time) {
            // Play sounds based on the clock time and the populated play times
            if (fountainPlayTimes.includes(clock_time)) {
                sound.play("F:\\Ilan\\DotaListener\\dota2-gsi\\file2.mp3"); // Play fountain sound
            }
            if (filePlayTimes.includes(clock_time)) {
                sound.play("F:\\Ilan\\DotaListener\\dota2-gsi\\file.mp3"); // Play file sound
            }
            if (stackPlayTimes.includes(clock_time)) {
                sound.play("F:\\Ilan\\DotaListener\\dota2-gsi\\stack.mp3"); // Play stack sound
            }
            if (pullPlayTimes.includes(clock_time)) {
                sound.play("F:\\Ilan\\DotaListener\\dota2-gsi\\pull.mp3"); // Play pull sound
            }
        });
    });
}

// IPC listener for starting sounds
ipcMain.on('start-sounds', () => {
    console.log('Starting sounds with predefined play times...');

    // Print the lists to the console when starting sounds
    console.log('Fountain Play Times:', fountainPlayTimes);
    console.log('File Play Times:', filePlayTimes);
    console.log('Pull Play Times:', pullPlayTimes);
    console.log('Stack Play Times:', stackPlayTimes);

    // Call the function to start playing sounds with the updated intervals
    startSoundEvents(); // Now this should work correctly
});

// Function to create the main application window
function createWindow() {
    const win = new BrowserWindow({
        width: 600,
        height: 400,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Load preload script for secure context
            nodeIntegration: true, // Enable Node.js integration
            contextIsolation: false // Disable context isolation
        }
    });

    win.loadFile('index.html'); // Load the HTML file for the application
}

// When the app is ready, create the main window
app.whenReady().then(createWindow);

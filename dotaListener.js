var d2gsi = require('dota2-gsi');
var sound = require('sound-play'); // Ensure sound-play is installed
var server = new d2gsi();

function getCurrentTime() {
    let now = new Date();
    return now.toISOString(); // Returns the time in ISO format
}

// Listen for new client connections
server.events.on('newclient', function (client) {
    console.log(`[${getCurrentTime()}] New client connection, IP address: ${client.ip}`);

    client.on('map:clock_time', function (clock_time) {
        if (clock_time !== undefined) {
            console.log(`[${getCurrentTime()}] Clock time: ${clock_time}`);

            // Define your play time lists
            const fountainPlayTimes = [80, 170, 260]; // Add all your intervals here
            const filePlayTimes = [390, 810]; // Add all your intervals here
            const StackPlayTimes = [47, 107]; // Add all your intervals here
            const PullPlayTimes = [98, 158]; // Add all your intervals here

            // Check if the current clock time is in the fountainPlayTimes list
            if (fountainPlayTimes.includes(clock_time)) {
                playSound("F:\\Ilan\\DotaListener\\dota2-gsi\\file2.mp3");
            }

            // Check if the current clock time is in the filePlayTimes list
            if (filePlayTimes.includes(clock_time)) {
                playSound("F:\\Ilan\\DotaListener\\dota2-gsi\\file.mp3");
            }
            // Check if the current clock time is in the StackPlayTimes list
            if (StackPlayTimes.includes(clock_time)) {
                playSound("F:\\Ilan\\DotaListener\\dota2-gsi\\stack.mp3");
            }
            // Check if the current clock time is in the PullPlayTimes list
            if (PullPlayTimes.includes(clock_time)) {
                playSound("F:\\Ilan\\DotaListener\\dota2-gsi\\pull.mp3");
            }
        }
    });
});

// Function to play sound using sound-play
async function playSound(filePath) {
    try {
        sound.play(filePath);
        console.log(`[${getCurrentTime()}] Playing sound from ${filePath}`);
    } catch (err) {
        console.error('Error playing sound:', err);
    }
}

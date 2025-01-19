export const convertSecondsToTime = (seconds) => {
    const hours = Math.floor(seconds / 3600); // 1 hour = 3600 seconds
    const minutes = Math.floor((seconds % 3600) / 60); // Remaining seconds divided by 60
    const secs = Math.floor(seconds % 60); // Remaining seconds

    // Format the output as HH:MM:SS
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

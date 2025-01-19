export const convertBytesToMB = (bytes) => {
    const mb = bytes / (1024 * 1024); // 1 MB = 1024 * 1024 bytes
    return mb.toFixed(2); // Return the result rounded to two decimal places
};

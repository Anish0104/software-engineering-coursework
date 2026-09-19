const fs = require('fs');

const filename = process.argv[2];

if (!filename) {
    console.error('Usage: node spreadsheet.js <filename.csv>');
    process.exit(1);
}

try {
    const content = fs.readFileSync(filename, 'utf8');

const lines = content.trimEnd().split(/\r?\n/);
const rows = [];

for (const line of lines) {
    rows.push(line.split(','));
}

// Find the longest value in each column.
const widths = [];

for (const row of rows) {
    for (let column = 0; column < row.length; column++) {
        widths[column] = Math.max(
            widths[column] || 0,
            row[column].length
        );
    }
}

// Pad each cell and print the row.
for (const row of rows) {
    const paddedCells = [];

    for (let column = 0; column < widths.length; column++) {
        const cell = row[column] ?? '';
        paddedCells.push(cell.padEnd(widths[column]));
    }

    console.log('| ' + paddedCells.join(' | ') + ' |');
}
} catch (error) {
    console.error('Unable to read file:', error.message);
    process.exitCode = 1;
}
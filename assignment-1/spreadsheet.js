const fs = require('fs');
const readline = require('readline');

function readFile(filename) {
    return fs.readFileSync(filename, 'utf8');
}

function parseCSV(content) {
    if (content === '') return [];

    const rows = [];
    let row = [];
    let cell = '';
    let insideQuotes = false;
    let quoteClosed = false;

    for (let i = 0; i < content.length; i++) {
        const character = content[i];

        if (insideQuotes) {
            if (character === '"') {
                if (content[i + 1] === '"') {
                    cell += '"';
                    i++;
                } else {
                    insideQuotes = false;
                    quoteClosed = true;
                }
            } else {
                cell += character;
            }
            continue;
        }

        if (character === ',') {
            row.push(cell);
            cell = '';
            quoteClosed = false;
        } else if (character === '\n' || character === '\r') {
            row.push(cell);
            rows.push(row);
            row = [];
            cell = '';
            quoteClosed = false;
            // Windows CRLF counts as a single line ending.
            if (character === '\r' && content[i + 1] === '\n') i++;
        } else if (quoteClosed) {
            throw new Error('Unexpected character after closing quote');
        } else if (character === '"') {
            if (cell.length > 0) {
                throw new Error('Unexpected quote inside unquoted cell');
            }
            insideQuotes = true;
        } else {
            cell += character;
        }
    }

    if (insideQuotes) throw new Error('Unclosed quoted cell');

    // A final newline already completed its row.
    if (row.length > 0 || cell.length > 0 || quoteClosed) {
        row.push(cell);
        rows.push(row);
    }
    return rows;
}

function formatTable(rows, hasHeader = false) {
    if (rows.length === 0) return '(empty spreadsheet)';

    const displayRows = rows.map(row =>
        row.map(cell => cell.replace(/\t/g, '    ').split(/\r\n|\n|\r/))
    );
    const widths = [];
    for (const row of displayRows) {
        for (let column = 0; column < row.length; column++) {
            for (const line of row[column]) {
                widths[column] = Math.max(widths[column] || 0, line.length);
            }
        }
    }

    const formattedRows = [];
    const separator = '+' + widths
        .map(width => '-'.repeat(width + 2)).join('+') + '+';

    for (const [rowIndex, row] of displayRows.entries()) {
        let height = 1;
        for (const cellLines of row) {
            height = Math.max(height, cellLines.length);
        }

        for (let lineIndex = 0; lineIndex < height; lineIndex++) {
            const paddedCells = [];
            for (let column = 0; column < widths.length; column++) {
                const cellLines = row[column] || [];
                const text = cellLines[lineIndex] ?? '';
                paddedCells.push(text.padEnd(widths[column]));
            }
            formattedRows.push('| ' + paddedCells.join(' | ') + ' |');
        }
        if (hasHeader && rowIndex === 0) formattedRows.push(separator);
    }
    return formattedRows.join('\n');
}

function displayFile(filename) {
    try {
        const content = readFile(filename);
        const rows = parseCSV(content);
        console.log(formatTable(rows, true));
    } catch (error) {
        console.error('Unable to display file:', error.message);
    }
}

function main() {
    const filename = process.argv[2];
    if (filename) displayFile(filename);

    const terminal = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    terminal.setPrompt('Enter a CSV file path (or exit): ');
    terminal.prompt();

    terminal.on('line', (answer) => {
        const filePath = answer.trim();
        if (filePath.toLowerCase() === 'exit') {
            terminal.close();
            return;
        }
        if (filePath === '') {
            console.log('Please enter a file path.');
        } else {
            displayFile(filePath);
        }
        terminal.prompt();
    });
}

if (require.main === module) main();
module.exports = { readFile, parseCSV, formatTable };
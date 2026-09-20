const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { readFile } = require('../spreadsheet');

describe('file reading and command-line interaction', () => {
    let temporaryDirectory;
    let csvPath;
    let missingPath;
    const programPath = path.resolve(__dirname, '../spreadsheet.js');

    beforeAll(() => {
        temporaryDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'spreadsheet-test-'));
        csvPath = path.join(temporaryDirectory, 'sample file.csv');
        missingPath = path.join(temporaryDirectory, 'missing.csv');
        fs.writeFileSync(csvPath, 'Name,Marks\nAnish,95', 'utf8');
    });
    afterAll(() => {
        fs.rmSync(temporaryDirectory, { recursive: true, force: true });
    });

    function runProgram(argumentsList, input) {
        const result = spawnSync(process.execPath, [programPath, ...argumentsList], {
            input, encoding: 'utf8', timeout: 5000
        });
        expect(result.error).toBeUndefined();
        expect(result.status).toBe(0);
        return result;
    }

    it('reads a file whose path contains spaces', () => {
        expect(readFile(csvPath)).toBe('Name,Marks\nAnish,95');
    });
    it('throws when the requested file does not exist', () => {
        expect(() => readFile(missingPath)).toThrowError();
    });
    it('displays a file supplied on the command line', () => {
        const result = runProgram([csvPath], 'exit\n');
        expect(result.stdout).toContain('| Anish | 95    |');
    });
    it('opens a file entered at the prompt', () => {
        const result = runProgram([], csvPath + '\nexit\n');
        expect(result.stdout).toContain('Enter a CSV file path');
        expect(result.stdout).toContain('| Anish | 95    |');
    });
    it('can open a valid file after a missing-file error', () => {
        const result = runProgram([], missingPath + '\n' + csvPath + '\nexit\n');
        expect(result.stderr).toContain('Unable to display file:');
        expect(result.stdout).toContain('| Anish | 95    |');
    });
    it('asks again when an empty path is entered', () => {
        expect(runProgram([], '\nexit\n').stdout)
            .toContain('Please enter a file path.');
    });
});
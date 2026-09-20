const { parseCSV, formatTable } = require('../spreadsheet');

describe('large spreadsheets and long values', () => {
    it('parses and displays all 1000 data rows', () => {
        const lines = ['ID,Value'];

        for (let i = 1; i <= 1000; i++) {
            lines.push(`${i},Item ${i}`);
        }

        const rows = parseCSV(lines.join('\n'));
        const outputLines = formatTable(rows).split('\n');

        expect(rows.length).toBe(1001);
        expect(outputLines.length).toBe(1001);

        for (let i = 1; i <= 1000; i++) {
            expect(rows[i]).toEqual([String(i), `Item ${i}`]);

            expect(outputLines[i]).toBe(
                '| ' + String(i).padEnd(4) +
                ' | ' + `Item ${i}`.padEnd(9) + ' |'
            );
        }
    });

    it('preserves long text and keeps columns aligned', () => {
        const longText = 'A'.repeat(200);

        const output = formatTable([
            [longText, '123'],
            ['short', '4']
        ]);

        const lines = output.split('\n');

        expect(lines[0]).toContain(longText);
        expect(lines[0].length).toBe(lines[1].length);
        expect(lines[0].lastIndexOf('|'))
            .toBe(lines[1].lastIndexOf('|'));
    });

    it('preserves long numbers as text without losing digits', () => {
        const numberText = '123456789012345678901234567890';
        const rows = parseCSV(`Account,${numberText}`);

        expect(rows[0][1]).toBe(numberText);
        expect(formatTable(rows)).toContain(numberText);
    });
});
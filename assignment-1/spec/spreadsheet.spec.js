const { parseCSV, formatTable } = require('../spreadsheet');

describe('parseCSV', () => {
    it('separates CSV text into rows and cells', () => {
        expect(parseCSV('A,B\n1,2')).toEqual([
            ['A', 'B'],
            ['1', '2']
        ]);
    });

    it('preserves empty cells and a trailing comma', () => {
        expect(parseCSV('Anish,,95,')).toEqual([
            ['Anish', '', '95', '']
        ]);
    });

    it('handles rows with different numbers of cells', () => {
        expect(parseCSV('A,B,C\n1,2')).toEqual([
            ['A', 'B', 'C'],
            ['1', '2']
        ]);
    });

    it('returns no rows for an empty file', () => {
        expect(parseCSV('')).toEqual([]);
    });

    it('preserves spaces inside cells', () => {
        expect(parseCSV('Anish,  hello  ')).toEqual([
            ['Anish', '  hello  ']
        ]);
    });

    it('keeps a quoted comma inside one cell', () => {
        expect(parseCSV('"Shirodkar, Anish",95')).toEqual([
            ['Shirodkar, Anish', '95']
        ]);
    });

    it('reads escaped quotes inside a quoted cell', () => {
        expect(parseCSV('"He said ""hello""",95')).toEqual([
            ['He said "hello"', '95']
        ]);
    });

    it('preserves a newline inside a quoted cell', () => {
        expect(parseCSV('"Hello\nWorld",95')).toEqual([
            ['Hello\nWorld', '95']
        ]);
    });

    it('handles Windows line endings and a final newline', () => {
        expect(parseCSV('Name,Marks\r\nAnish,95\r\n')).toEqual([
            ['Name', 'Marks'],
            ['Anish', '95']
        ]);
    });

    it('preserves an empty quoted cell', () => {
        expect(parseCSV('""')).toEqual([
            ['']
        ]);
    });

    it('keeps formulas as plain text', () => {
        expect(parseCSV('Total,=SUM(A1:A3)')).toEqual([
            ['Total', '=SUM(A1:A3)']
        ]);
    });

    it('rejects an unclosed quoted cell', () => {
        expect(() => parseCSV('"Anish,95'))
            .toThrowError('Unclosed quoted cell');
    });

    it('rejects a quote inside an unquoted cell', () => {
        expect(() => parseCSV('An"ish,95'))
            .toThrowError('Unexpected quote inside unquoted cell');
    });

    it('rejects text after a closing quote', () => {
        expect(() => parseCSV('"Anish"x,95'))
            .toThrowError('Unexpected character after closing quote');
    });
});

describe('formatTable', () => {
    it('aligns cells with different lengths', () => {
        expect(formatTable([
            ['Name', 'Marks'],
            ['Sam', '8']
        ])).toBe(
            '| Name | Marks |\n' +
            '| Sam  | 8     |'
        );
    });

    it('adds a separator below the header when requested', () => {
        expect(formatTable([
            ['Name', 'Marks'],
            ['Sam', '8']
        ], true)).toBe(
            '| Name | Marks |\n' +
            '+------+-------+\n' +
            '| Sam  | 8     |'
        );
    });

    it('fills missing cells in uneven rows', () => {
        expect(formatTable([
            ['A', 'B'],
            ['1']
        ])).toBe(
            '| A | B |\n' +
            '| 1 |   |'
        );
    });

    it('aligns multiline cells', () => {
        expect(formatTable([
            ['Hello\nWorld', '95']
        ])).toBe(
            '| Hello | 95 |\n' +
            '| World |    |'
        );
    });

    it('expands tabs to four spaces', () => {
        expect(formatTable([
            ['A\tB', '9']
        ])).toBe('| A    B | 9 |');
    });

    it('displays a message for an empty spreadsheet', () => {
        expect(formatTable([])).toBe('(empty spreadsheet)');
    });
});
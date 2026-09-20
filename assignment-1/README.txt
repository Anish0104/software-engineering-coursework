Assignment 1 — Problem 2.1.5
Reading and Printing a Spreadsheet Document
Anish Shirodkar

PURPOSE

This Node.js program reads a CSV file using the built-in fs module
and prints its contents as an aligned plain-text table. A file can
be selected through a command-line argument or an interactive prompt.
Formulas are displayed as text and are not evaluated.

SETUP AND RUNNING

Open a terminal in the assignment-1 folder.

Install the dependencies:
    npm ci

Run the automated tests:
    npx jasmine

Display a CSV:
    node spreadsheet.js demo.csv

Start directly at the interactive prompt:
    node spreadsheet.js

At the prompt, enter a filename such as sample.csv, or an absolute
file path. Enter exit to close the program.

For command-line paths containing spaces, use quotation marks:
    node spreadsheet.js "sample file.csv"

At the interactive prompt, enter the path without quotation marks.

PROGRAM DESIGN

readFile(filename)
Reads the file as UTF-8 text using fs.readFileSync.

parseCSV(content)
Scans the text one character at a time. It tracks whether the current
cell is quoted so that commas and newlines inside quotes remain part
of the cell. Two consecutive quotes inside a quoted cell represent
one literal quotation mark.

The parser preserves empty cells, trailing empty cells, and spaces.
It accepts rows with different numbers of cells. It reports errors
for unclosed quotes, quotes inside unquoted cells, and unexpected
characters after a closing quote.

formatTable(rows, hasHeader)
Finds the longest display line in each column and pads shorter values
with spaces. Vertical bars separate the columns. Missing cells in
uneven rows appear blank.

Tabs are displayed as four spaces. Multiline cells occupy multiple
display lines, with neighboring cells padded as needed.

When hasHeader is true, a horizontal separator appears below the
first row. The interactive program uses this setting. No row is
removed if a CSV has no header.

displayFile(filename)
Combines reading, parsing, and formatting. If an error occurs, it
prints an error message and allows the user to try another file.

main()
Reads the optional command-line filename and starts the file-path
prompt using Node's built-in readline module.

The functions are exported so Jasmine can test them. The
require.main check prevents the prompt from starting when the
test files import the program.

FORMATTING DECISION

Spaces provide predictable alignment for the example data. Printing
only commas or tabs would not keep columns aligned when cell lengths
differ. Column widths are calculated from the input rather than
hardcoded for a particular dataset.

TESTING AND RESULTS

The test suite contains 29 Jasmine specifications:

- 14 tests for CSV parsing.
- 6 tests for table formatting.
- 6 tests for file reading and command-line interaction.
- 3 tests for large tables and long values.

Cases include quoted commas, escaped quotes, multiline cells,
Windows line endings, empty input, empty cells, trailing commas,
spaces, tabs, uneven rows, malformed quotes, and formula text.

File interaction tests use temporary files and run the actual program
in a separate process. They check paths containing spaces, missing
files, interactive selection, recovery after errors, and blank input.

The large-table test verifies 1,000 data rows plus a header.
Other tests check 200-character text and a long numerical string
whose digits must be preserved.

The latest local test run completed with:
    29 specs, 0 failures

DATA FILES AND SCREENSHOTS

sample.csv
A small example used during development.

demo.csv
A constructed example containing empty cells, quoted commas,
escaped quotes, multiline text, uneven rows, and a formula.

tips.csv
The restaurant tips dataset downloaded from the Seaborn data
repository:
https://github.com/mwaskom/seaborn-data/blob/master/tips.csv

tips-preview.csv
The header and first 10 records of tips.csv, created for a readable
screenshot. The original tips.csv remains unchanged.

tips-result.png
Shows the preview table and the passing Jasmine test results.

demo-result.png
Shows the formatting of unusual spreadsheet cells.

LIMITATIONS

The program reads the complete file and builds the output in memory.
Very wide tables may wrap in a narrow terminal, while tall tables
require scrolling.

Padding uses JavaScript string lengths. Wide Unicode characters,
emoji, and combining characters may not align correctly.

Input is expected to be comma-separated UTF-8 text. A UTF-8
byte-order mark is not specially removed. File extensions are not
checked; malformed quoting is detected by the parser.

All values remain strings. The temporary arrays support printing;
the program does not implement cell editing or formula evaluation.
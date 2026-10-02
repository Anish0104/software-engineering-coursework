ASSIGNMENT 1: READING AND PRINTING A SPREADSHEET DOCUMENT
Problem 2.1.5
Name: Anish Shirodkar
NetID: avs181


1. PURPOSE
----------------------------------------------------------------------

This Node.js program reads a CSV file and displays its contents as an aligned plain-text table in the terminal.

Users can select a file through a command-line argument or an interactive prompt. Formulas are displayed as text and are not evaluated.


2. SETUP
----------------------------------------------------------------------

Tested environment:

    Node.js     v20.20.2
    npm         10.8.2

Open a terminal inside the assignment-1 directory and install the testing dependencies:

    npm ci

The program uses built-in Node.js modules. Jasmine is required only for automated testing.


3. RUNNING THE PROGRAM
----------------------------------------------------------------------

Display the basic sample:

    node spreadsheet.js sample.csv

Display the CSV edge-case demonstration:

    node spreadsheet.js demo.csv

Display the complete tips dataset:

    node spreadsheet.js tips.csv

Display the first 10 data rows of the tips dataset:

    node spreadsheet.js tips-preview.csv

Start directly at the interactive prompt:

    node spreadsheet.js


INTERACTIVE INPUT

    Enter a CSV file path (or exit): sample.csv

Enter a relative or absolute file path. Relative paths are resolved from the directory where the program was started.

Enter exit to close the program:

    Enter a CSV file path (or exit): exit

Return to the shell before entering commands such as npx jasmine.


PATHS CONTAINING SPACES

Use quotation marks when supplying a path on the command line:

    node spreadsheet.js "sample file.csv"

At the interactive prompt, enter the path without surrounding quotes.


4. SUPPORTED FEATURES
----------------------------------------------------------------------

    CSV parsing
    -----------
    - Empty cells and trailing empty cells
    - Spaces within values
    - Rows with different numbers of cells
    - Commas inside quoted cells
    - Escaped quotation marks
    - Newlines inside quoted cells
    - LF, CRLF, and CR record endings

    Table formatting
    ----------------
    - Automatically calculated column widths
    - Aligned columns with padded values
    - Horizontal separator below the header
    - Multiline cells displayed across aligned terminal lines
    - Missing cells displayed as empty cells
    - Each tab replaced with four spaces
    - Long numbers and formulas preserved as text

    File handling and interaction
    -----------------------------
    - UTF-8 file reading
    - Command-line and interactive file selection
    - Multiple files viewed during one session
    - Error messages for missing files and malformed CSV input
    - Continued interaction after an error
    - Empty-file message: "(empty spreadsheet)"


5. PROGRAM DESIGN
----------------------------------------------------------------------

    readFile(filename)

        Reads the requested file as UTF-8 text using fs.readFileSync.
        Passes file-reading errors to the caller.


    parseCSV(content)

        Scans the input one character at a time and produces an array
        of rows. Each row contains an array of string values.

        Tracks quoted cells so that commas and newlines inside
        quotation marks remain part of the cell value.

        Rejects:
        - Unclosed quoted cells
        - Quotes inside unquoted cells
        - Unexpected text after a closing quote


    formatTable(rows, hasHeader = false)

        Calculates column widths and pads values to align the table.

        Supports multiline cells and fills missing cells in shorter
        rows with empty values.

        Adds a separator after the first row when hasHeader is true.


    displayFile(filename)

        Reads, parses, and displays a file with the header separator.
        Reports errors without ending the interactive session.


    main()

        Displays the optional command-line file and starts the
        interactive prompt using Node.js readline.


The program starts only when spreadsheet.js is executed directly. Importing it in a test does not start the interactive prompt.

Exported functions:

    readFile
    parseCSV
    formatTable


6. AUTOMATED TESTING
----------------------------------------------------------------------

Run from the assignment-1 directory:

    npx jasmine

Latest recorded result:

                        29 specs, 0 failures


    TEST FILE                         NUMBER OF TESTS
    ------------------------------------------------
    spec/spreadsheet.spec.js                 20
    spec/fileIO.spec.js                       6
    spec/largeTable.spec.js                   3
    ------------------------------------------------
    TOTAL                                   29


    Parsing and formatting tests

        Cover CSV values, quoted fields, malformed input, alignment, multiline cells, tabs, empty input, and the header separator.


    File and interaction tests

        Cover file reading, paths containing spaces, missing files, command-line input, interactive input, and error recovery. Temporary test files are removed after the tests finish.


    Large-table tests

        Cover 1,000 data rows, long text, and long numeric strings.


Jasmine randomizes the test order. Its printed seed can be used to reproduce a particular ordering.


7. DATA FILES
----------------------------------------------------------------------

    sample.csv

        A small example containing names, subjects, and marks.


    demo.csv

        A manually created dataset demonstrating quoted commas, escaped quotes, missing values, multiline values, formulas, uneven rows, and a trailing empty cell.


    tips.csv

        An external dataset containing restaurant bill and tip information, obtained from the seaborn-data repository.

        Source:
        https://github.com/mwaskom/seaborn-data/blob/master/tips.csv


    tips-preview.csv

        Contains the header and first 10 data rows from tips.csv.

        Created with:

            head -n 11 tips.csv > tips-preview.csv

        The original tips.csv remains unchanged.

        This line-based preview works for this dataset. Files with  multiline quoted fields require parsing to select complete rows correctly.


8. SCREENSHOTS
----------------------------------------------------------------------

    tips-result.png

        Shows the formatted tips preview and a successful Jasmine test run with 29 specs and 0 failures.


    demo-result.png

        Shows the formatted output for the CSV edge-case examples.


9. LIMITATIONS
----------------------------------------------------------------------

    - Supports CSV text, not Excel workbook formats such as XLSX.

    - Displays formulas literally without calculating them.

    - Loads the complete file into memory.

    - Wide tables may wrap in a narrow terminal window.

    - Uses JavaScript string length to calculate column widths.
      Emoji and full-width Unicode characters may not align precisely.

    - Does not explicitly remove a UTF-8 byte-order mark.

    - Interprets input as CSV without validating the file extension.

    - Treats the first row as a header when displaying a file.

    - Trims paths entered at the prompt, so leading or trailing
      spaces in filenames are not preserved.


10. PROJECT FILES
----------------------------------------------------------------------

    spreadsheet.js          Program implementation
    package.json            Project metadata and dependencies
    package-lock.json       Locked dependency versions
    spec/                   Tests and Jasmine configuration

    sample.csv              Basic sample
    demo.csv                CSV edge-case examples
    tips.csv                External dataset
    tips-preview.csv        Short dataset preview

    tips-result.png         Dataset output and test screenshot
    demo-result.png         Edge-case output screenshot

    README.txt              Plain-text documentation
    README.md               GitHub-formatted documentation


11. DEPENDENCIES AND SUBMISSION
----------------------------------------------------------------------

The node_modules directory is excluded from version control and the submission archive.

Restore testing dependencies with:

    npm ci

Run the automated tests with:

    npx jasmine

======================================================================
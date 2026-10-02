# Assignment 2: Reading and Writing a Records Document

**Student:** Anish Shirodkar  
**Problem:** 2.2.6  
**Tested runtime:** Node.js v20.20.2  
**Testing framework:** Jasmine

## Overview

This Node.js program reads a local records document using the `fs`
module, validates its contents, reports errors with line numbers,
sorts records by their TIME strings, and writes the sorted records
to a new file.

Sorting is implemented separately in `sortRecords.js`.

## Setup

Open a terminal inside `assignment-2` and install the test dependencies:

```bash
npm ci
```

## Run the program

```bash
node records.js input.txt new-output.txt
```

Usage:

```text
node records.js <input-file> [output-file] [registry-file]
```

- The input filename is required.
- The default output filename is `sorted.txt`.
- The optional registry contains previously used identifiers, one per line.
- Paths are interpreted relative to the terminal's current directory.
- The output filename must not already exist.
- Validation errors prevent output-file creation.
- The program exits with status 0 on success and 1 on error.

The supplied `sample-sorted.txt` shows the sorted output of `input.txt`.
Running `node records.js input.txt` writes `sorted.txt`; delete that file
before running the same command again.

## Input format

```text
BEGIN:RECORD
IDENTIFIER: example-001
TIME: 20250927T101530
WEIGHT: 72.4
UNITS: kilograms
COLOR: #2F54EB
END:RECORD
```

Record markers and property names are case-insensitive.
Properties may appear in any order. Blank lines are tolerated.
An empty input file produces an empty output file.

### Property rules

| Property | Validation |
|---|---|
| IDENTIFIER | Required, nonempty, and checked for duplicate values |
| TIME | Required; valid date and time in YYYYMMDDTHHMMSS format |
| WEIGHT | Optional; finite, nonnegative decimal number |
| UNITS | Required when WEIGHT appears; kilograms or pounds |
| COLOR | Optional; predefined name, #RGB, #RRGGBB, or integer RGB triple |

No property may appear more than once in a record.

## Validation conventions and limitations

- TIME accepts years 0001–9999 and validates month lengths and leap years.
  Hours are 00–23; minutes and seconds are 00–59.
  Values represent local date-time without a timezone offset.
- WEIGHT accepts zero and decimal fractions, including `.5`.
  Negative numbers, scientific notation, and values with unit suffixes
  are rejected.
- UNITS and named colors are compared case-insensitively.
- COLOR names are defined in `colors.js`. RGB components must be
  integers between 0 and 255.
- IDENTIFIER values are case-sensitive.
- Leading and trailing whitespace is trimmed.
- Within a property value, whitespace followed by a name and colon
  is interpreted as another property on the same line. Unrestricted
  text containing that pattern is ambiguous under this convention.
- Missing-property errors identify the record's starting line.
- Errors are listed in line order.
- Malformed record markers are reported and skipped while parsing
  continues, which may produce additional structural errors.

### Identifier registry

Example:

```bash
node records.js input.txt registry-check.txt known-identifiers.txt
```

The supplied registry includes `A-001`, so this demonstration reports
a conflict and writes no output.

Without a registry, duplicate checking covers only the current input.
With a registry, it also checks the supplied previously used IDs.
The registry is not automatically updated. Global uniqueness against
unknown records is not independently guaranteed; cross-file checking
depends on the completeness of the supplied registry.

## Sorting and output

Records are sorted in ascending order of their validated TIME strings.
Records with equal timestamps retain their input order.

The output uses this property order:

1. IDENTIFIER
2. TIME
3. WEIGHT, when present
4. UNITS, when present
5. COLOR, when present

Property names are uppercase. Values retain their input capitalization.
Records are written one after another with no blank lines between them,
matching the expected output in the assignment.

## Assignment example

`example.txt` contains the three-record example input from the assignment,
and `example-expected.txt` contains the expected sorted output given in
the assignment.

```bash
node records.js example.txt example-output.txt
diff example-expected.txt example-output.txt
```

`diff` prints nothing, confirming the output matches exactly.
(On Windows PowerShell, use `fc.exe example-expected.txt example-output.txt`.)

## Tests

```bash
npm test
```

Verified result:

```text
47 specs, 0 failures
```

| Test file | Tests |
|---|---:|
| spec/records.spec.js | 25 |
| spec/colors.spec.js | 8 |
| spec/sortRecords.spec.js | 5 |
| spec/fileIO.spec.js | 9 |
| Total | 47 |

Tests cover parsing, required properties, duplicate properties and IDs,
registry conflicts, dates, colors, weights, units, formatting errors,
sorting, and file operations.

File-operation tests use temporary folders and clean them up afterward.

## Example error demonstrations

```bash
node records.js invalid.txt
node records.js invalid-time.txt
node records.js invalid-weight.txt
node records.js input.txt registry-check.txt known-identifiers.txt
```

Expected error counts are 4, 2, 3, and 1 respectively.
These examples intentionally fail validation.

## Files

| File | Purpose |
|---|---|
| records.js | Parsing, validation, formatting, and command-line file operations |
| colors.js | Color validation |
| sortRecords.js | Separate sorting function |
| input.txt | Ten valid sample records |
| invalid.txt | Structure and required-property errors |
| invalid-time.txt | Invalid date and time examples |
| invalid-weight.txt | Invalid weight and unit examples |
| known-identifiers.txt | Registry conflict demonstration |
| sample-sorted.txt | Sorted output of input.txt |
| example.txt | Example input from the assignment |
| example-expected.txt | Expected output from the assignment |
| results.txt | Captured terminal results |
| spec/ | Jasmine tests and configuration |
| package.json | Project configuration and test command |
| package-lock.json | Locked dependency versions |
| SE_Assignment2_Results.pdf | Program results report |
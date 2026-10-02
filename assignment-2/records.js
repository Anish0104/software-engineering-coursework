const fs = require("fs");
const { isValidColor } = require("./colors");
const { sortRecords } = require("./sortRecords");

function isValidTime(value) {
    // Format: YYYYMMDDTHHMMSS
    if (!/^\d{8}T\d{6}$/.test(value)) {
        return false;
    }

    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6));
    const day = Number(value.slice(6, 8));
    const hour = Number(value.slice(9, 11));
    const minute = Number(value.slice(11, 13));
    const second = Number(value.slice(13, 15));

    if (year < 1 || month < 1 || month > 12) {
        return false;
    }

    if (hour > 23 || minute > 59 || second > 59) {
        return false;
    }

    const isLeapYear =
        year % 400 === 0 ||
        (year % 4 === 0 && year % 100 !== 0);

    const daysInMonth = [
        31, isLeapYear ? 29 : 28, 31, 30,
        31, 30, 31, 31, 30, 31, 30, 31
    ];

    return day >= 1 && day <= daysInMonth[month - 1];
}

function isValidWeight(value) {
    const decimalPattern = /^(?:\d+(?:\.\d+)?|\.\d+)$/;

    return decimalPattern.test(value) &&
        Number.isFinite(Number(value));
}

function isValidUnits(value) {
    const units = value.toLowerCase();

    return units === "kilograms" || units === "pounds";
}

function parseRecords(text, knownIdentifiers = new Set()) {
    const lines = text.split(/\r\n|\n|\r/);
    const records = [];
    const errors = [];

    // Track identifiers and their first line numbers in this input.
    const identifierLines = new Map();

    const allowedProperties = new Set([
        "IDENTIFIER",
        "TIME",
        "WEIGHT",
        "UNITS",
        "COLOR"
    ]);

    let currentRecord = null;
    let startLine = 0;

    function checkRequiredProperties() {
        for (const name of ["IDENTIFIER", "TIME"]) {
            if (!Object.hasOwn(currentRecord, name)) {
                errors.push(
                    `Line ${startLine}: Missing required property ${name}.`
                );
            }
        }

        if (
            Object.hasOwn(currentRecord, "WEIGHT") &&
            !Object.hasOwn(currentRecord, "UNITS")
        ) {
            errors.push(
                `Line ${startLine}: Missing UNITS for a record with WEIGHT.`
            );
        }
    }

    function processProperty(name, value, lineNumber) {
        if (!allowedProperties.has(name)) {
            errors.push(
                `Line ${lineNumber}: Unknown property "${name}".`
            );
        }

        if (value === "") {
            errors.push(
                `Line ${lineNumber}: Missing value for "${name}".`
            );
        }

        if (!allowedProperties.has(name)) {
            return;
        }

        if (value !== "") {
            if (name === "TIME" && !isValidTime(value)) {
                errors.push(
                    `Line ${lineNumber}: Invalid TIME "${value}"; ` +
                    "expected a real date and time in YYYYMMDDTHHMMSS format."
                );
            }

            if (name === "WEIGHT" && !isValidWeight(value)) {
                errors.push(
                    `Line ${lineNumber}: Invalid WEIGHT "${value}"; ` +
                    "expected a finite, nonnegative decimal number."
                );
            }

            if (name === "UNITS" && !isValidUnits(value)) {
                errors.push(
                    `Line ${lineNumber}: Invalid UNITS "${value}"; ` +
                    'expected "kilograms" or "pounds".'
                );
            }

            if (name === "COLOR" && !isValidColor(value)) {
                errors.push(
                    `Line ${lineNumber}: Invalid COLOR "${value}"; ` +
                    "expected a recognized color name, #RGB, #RRGGBB, " +
                    "or rgb(r, g, b) with integers from 0 to 255."
                );
            }
        }

        // Keep the first value when a property is repeated.
        if (Object.hasOwn(currentRecord, name)) {
            errors.push(
                `Line ${lineNumber}: Duplicate property ${name}.`
            );
            return;
        }

        // Identifier values are compared case-sensitively.
        if (name === "IDENTIFIER" && value !== "") {
            if (knownIdentifiers.has(value)) {
                errors.push(
                    `Line ${lineNumber}: IDENTIFIER "${value}" ` +
                    "already exists in the supplied identifier registry."
                );
            }

            if (identifierLines.has(value)) {
                errors.push(
                    `Line ${lineNumber}: Duplicate IDENTIFIER "${value}"; ` +
                    `first seen on line ${identifierLines.get(value)}.`
                );
            } else {
                identifierLines.set(value, lineNumber);
            }
        }

        currentRecord[name] = value;
    }

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineNumber = i + 1;
        const upperLine = line.toUpperCase();

        if (line === "") {
            continue;
        }

        if (upperLine === "BEGIN:RECORD") {
            if (currentRecord !== null) {
                errors.push(
                    `Line ${lineNumber}: Unexpected BEGIN:RECORD; ` +
                    `record starting on line ${startLine} is missing END:RECORD.`
                );

                checkRequiredProperties();
            }

            currentRecord = {};
            startLine = lineNumber;
            continue;
        }

        if (upperLine === "END:RECORD") {
            if (currentRecord === null) {
                errors.push(
                    `Line ${lineNumber}: Unexpected END:RECORD without BEGIN:RECORD.`
                );
            } else {
                checkRequiredProperties();
                records.push(currentRecord);
                currentRecord = null;
            }

            continue;
        }

        // Detect malformed markers and markers sharing a line with text.
        const startsLikeMarker = /^(?:BEGIN|END)\b/i.test(line);
        const containsMarker =
            /\b(?:BEGIN|END)\s*:\s*RECORD\b/i.test(line);

        if (startsLikeMarker || containsMarker) {
            errors.push(
                `Line ${lineNumber}: Invalid record marker; ` +
                "BEGIN:RECORD or END:RECORD must appear alone on its line."
            );
            continue;
        }

        if (currentRecord === null) {
            errors.push(
                `Line ${lineNumber}: Content outside a record.`
            );
            continue;
        }

        const colonIndex = line.indexOf(":");

        if (colonIndex === -1) {
            errors.push(
                `Line ${lineNumber}: Invalid property format; missing colon.`
            );
            continue;
        }

        const name = line
            .slice(0, colonIndex)
            .trim()
            .toUpperCase();

        // Trim first so a value like urn:uuid:123 is not split.
        const valueText = line.slice(colonIndex + 1).trim();

        // Interpret whitespace followed by NAME: as another property.
        const extraProperties = [
            ...valueText.matchAll(
                /\s+([A-Za-z_][A-Za-z0-9_-]*)\s*:/g
            )
        ];

        if (extraProperties.length === 0) {
            processProperty(name, valueText, lineNumber);
            continue;
        }

        errors.push(
            `Line ${lineNumber}: Multiple properties on one line; ` +
            "each property must appear on its own line."
        );

        // Recover each property to report its other errors too.
        processProperty(
            name,
            valueText.slice(0, extraProperties[0].index).trim(),
            lineNumber
        );

        for (let j = 0; j < extraProperties.length; j++) {
            const match = extraProperties[j];
            const valueStart = match.index + match[0].length;

            const valueEnd =
                j + 1 < extraProperties.length
                    ? extraProperties[j + 1].index
                    : valueText.length;

            processProperty(
                match[1].toUpperCase(),
                valueText.slice(valueStart, valueEnd).trim(),
                lineNumber
            );
        }
    }

    if (currentRecord !== null) {
        errors.push(
            `Line ${startLine}: Unclosed record; missing END:RECORD at end of file.`
        );

        checkRequiredProperties();
    }

    return { records, errors };
}

function formatRecords(records) {
    const propertyOrder = [
        "IDENTIFIER",
        "TIME",
        "WEIGHT",
        "UNITS",
        "COLOR"
    ];

    const blocks = records.map(function (record) {
        const lines = ["BEGIN:RECORD"];

        for (const name of propertyOrder) {
            if (Object.hasOwn(record, name)) {
                lines.push(`${name}: ${record[name]}`);
            }
        }

        lines.push("END:RECORD");
        return lines.join("\n");
    });

    return blocks.length === 0
        ? ""
        : blocks.join("\n") + "\n";
}

function main() {
    const inputFile = process.argv[2];
    const outputFile = process.argv[3] || "sorted.txt";
    const registryFile = process.argv[4];

    if (!inputFile) {
        console.error(
            "Usage: node records.js <input-file> [output-file] [registry-file]"
        );
        process.exitCode = 1;
        return;
    }

    let content;

    try {
        content = fs.readFileSync(inputFile, "utf8");
    } catch (error) {
        console.error(
            `Could not read "${inputFile}": ${error.message}`
        );
        process.exitCode = 1;
        return;
    }

    let knownIdentifiers = new Set();

    if (registryFile) {
        try {
            const registryText = fs.readFileSync(registryFile, "utf8");

            knownIdentifiers = new Set(
                registryText
                    .split(/\r\n|\n|\r/)
                    .map(line => line.trim())
                    .filter(line => line !== "")
            );
        } catch (error) {
            console.error(
                `Could not read identifier registry "${registryFile}": ` +
                error.message
            );
            process.exitCode = 1;
            return;
        }
    }

    const { records, errors } = parseRecords(
        content,
        knownIdentifiers
    );

    if (errors.length > 0) {
        // List errors in file order (stable for errors on the same line).
        errors.sort(function (a, b) {
            return Number(a.match(/^Line (\d+)/)[1]) -
                Number(b.match(/^Line (\d+)/)[1]);
        });

        console.error(`Found ${errors.length} error(s):`);

        for (const error of errors) {
            console.error(error);
        }

        console.error("No output file was written.");
        process.exitCode = 1;
        return;
    }

    const sortedRecords = sortRecords(records);
    const outputText = formatRecords(sortedRecords);

    try {
        // Create a new file; never overwrite an existing file.
        fs.writeFileSync(outputFile, outputText, {
            encoding: "utf8",
            flag: "wx"
        });
    } catch (error) {
        if (error.code === "EEXIST") {
            console.error(
                `Output file "${outputFile}" already exists. ` +
                "Choose a new output filename."
            );
        } else {
            console.error(
                `Could not write "${outputFile}": ${error.message}`
            );
        }

        process.exitCode = 1;
        return;
    }

    console.log(
        `Successfully validated and sorted ${records.length} ` +
        `record${records.length === 1 ? "" : "s"}.`
    );
    console.log(`Saved to: ${outputFile}`);
}

if (require.main === module) {
    main();
}

module.exports = {
    parseRecords,
    isValidTime,
    isValidWeight,
    isValidUnits,
    isValidColor,
    formatRecords
};
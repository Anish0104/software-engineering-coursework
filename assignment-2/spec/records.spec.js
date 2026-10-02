const {
    parseRecords,
    isValidTime,
    isValidWeight,
    isValidUnits
} = require("../records");

function makeRecord(properties) {
    return [
        "BEGIN:RECORD",
        ...properties,
        "END:RECORD"
    ].join("\n");
}

describe("TIME validation", function () {
    it("accepts a valid leap day", function () {
        expect(isValidTime("20240229T235959")).toBeTrue();
    });

    it("rejects February 29 in a non-leap year", function () {
        expect(isValidTime("20250229T120000")).toBeFalse();
    });

    it("handles century leap-year rules", function () {
        expect(isValidTime("20000229T120000")).toBeTrue();
        expect(isValidTime("19000229T120000")).toBeFalse();
    });

    it("rejects a day beyond the month's length", function () {
        expect(isValidTime("20250431T120000")).toBeFalse();
    });

    it("checks clock boundaries", function () {
        expect(isValidTime("20250927T000000")).toBeTrue();
        expect(isValidTime("20250927T240000")).toBeFalse();
        expect(isValidTime("20250927T126000")).toBeFalse();
        expect(isValidTime("20250927T120060")).toBeFalse();
    });

    it("rejects an incorrectly formatted time", function () {
        expect(isValidTime("2025-09-27T10:15:30")).toBeFalse();
    });
});

describe("WEIGHT and UNITS validation", function () {
    it("accepts zero and fractional weights", function () {
        expect(isValidWeight("0")).toBeTrue();
        expect(isValidWeight(".5")).toBeTrue();
        expect(isValidWeight("72.4")).toBeTrue();
    });

    it("rejects negative, nonnumeric, and infinite weights", function () {
        expect(isValidWeight("-5")).toBeFalse();
        expect(isValidWeight("heavy")).toBeFalse();
        expect(isValidWeight("72kg")).toBeFalse();
        expect(isValidWeight("9".repeat(400))).toBeFalse();
    });

    it("accepts supported units regardless of capitalization", function () {
        expect(isValidUnits("KILOGRAMS")).toBeTrue();
        expect(isValidUnits("Pounds")).toBeTrue();
        expect(isValidUnits("grams")).toBeFalse();
    });
});

describe("Record parsing", function () {
    it("accepts an empty file", function () {
        expect(parseRecords("")).toEqual({
            records: [],
            errors: []
        });
    });

    it("accepts mixed-case keywords, blank lines, and reordered properties", function () {
        const text = [
            "",
            "begin:record",
            "TiMe: 20250927T101530",
            "",
            "identifier: a-001",
            "end:record",
            ""
        ].join("\n");

        const result = parseRecords(text);

        expect(result.errors).toEqual([]);
        expect(result.records).toEqual([
            {
                TIME: "20250927T101530",
                IDENTIFIER: "a-001"
            }
        ]);
    });

    it("reports duplicate properties and keeps the first value", function () {
        const result = parseRecords(makeRecord([
            "IDENTIFIER: test-001",
            "TIME: 20250927T101530",
            "COLOR: blue",
            "color: red"
        ]));

        expect(result.errors).toEqual([
            "Line 5: Duplicate property COLOR."
        ]);

        expect(result.records[0].COLOR).toBe("blue");
    });

    it("reports all four errors in the invalid sample", function () {
        const result = parseRecords(makeRecord([
            "TIME: 20250927T101530",
            "WEIGHT: 72.4",
            "COLOR: blue",
            "color: red",
            "SIZE: large"
        ]));

        expect(result.errors.length).toBe(4);

        expect(result.errors).toContain(
            "Line 5: Duplicate property COLOR."
        );

        expect(result.errors).toContain(
            'Line 6: Unknown property "SIZE".'
        );

        expect(result.errors).toContain(
            "Line 1: Missing required property IDENTIFIER."
        );

        expect(result.errors).toContain(
            "Line 1: Missing UNITS for a record with WEIGHT."
        );
    });

    it("reports an empty required value", function () {
        const result = parseRecords(makeRecord([
            "IDENTIFIER:",
            "TIME: 20250927T101530"
        ]));

        expect(result.errors).toEqual([
            'Line 2: Missing value for "IDENTIFIER".'
        ]);
    });

    it("reports a missing closing marker", function () {
        const result = parseRecords([
            "BEGIN:RECORD",
            "IDENTIFIER: test-001",
            "TIME: 20250927T101530"
        ].join("\n"));

        expect(result.errors).toEqual([
            "Line 1: Unclosed record; missing END:RECORD at end of file."
        ]);
    });

    it("continues checking records after an invalid time", function () {
        const first = makeRecord([
            "IDENTIFIER: test-001",
            "TIME: 20250230T101530"
        ]);

        const second = makeRecord([
            "TIME: 20250927T101530"
        ]);

        const result = parseRecords(first + "\n" + second);

        expect(result.errors.length).toBe(2);

        expect(result.errors[0]).toContain(
            "Line 3: Invalid TIME"
        );

        expect(result.errors).toContain(
            "Line 5: Missing required property IDENTIFIER."
        );
    });
});

describe("Identifier uniqueness within the input", function () {
    it("reports an identifier repeated across records", function () {
        const text = [
            makeRecord([
                "IDENTIFIER: repeated-id",
                "TIME: 20250927T100000"
            ]),
            makeRecord([
                "IDENTIFIER: repeated-id",
                "TIME: 20250927T110000"
            ])
        ].join("\n");

        const result = parseRecords(text);

        expect(result.errors).toEqual([
            'Line 6: Duplicate IDENTIFIER "repeated-id"; first seen on line 2.'
        ]);
    });

    it("preserves case-sensitive identifier values", function () {
        const text = [
            makeRecord([
                "IDENTIFIER: A-001",
                "TIME: 20250927T100000"
            ]),
            makeRecord([
                "IDENTIFIER: a-001",
                "TIME: 20250927T110000"
            ])
        ].join("\n");

        expect(parseRecords(text).errors).toEqual([]);
    });

    it("allows the same file to be checked again independently", function () {
        const text = makeRecord([
            "IDENTIFIER: test-001",
            "TIME: 20250927T100000"
        ]);

        expect(parseRecords(text).errors).toEqual([]);
        expect(parseRecords(text).errors).toEqual([]);
    });
});

describe("Additional formatting checks", function () {
    it("reports multiple properties on one line", function () {
        const result = parseRecords(makeRecord([
            "IDENTIFIER: format-001",
            "TIME: 20250927T100000",
            "WEIGHT: 72 UNITS: kilograms"
        ]));

        expect(result.errors).toEqual([
            "Line 4: Multiple properties on one line; " +
            "each property must appear on its own line."
        ]);
    });

    it("also validates properties recovered from a combined line", function () {
        const result = parseRecords(makeRecord([
            "IDENTIFIER: format-002",
            "TIME: 20250927T100000",
            "WEIGHT: -5 UNITS: grams"
        ]));

        expect(result.errors.length).toBe(3);
        expect(result.errors[0]).toContain("Multiple properties");
        expect(result.errors[1]).toContain("Invalid WEIGHT");
        expect(result.errors[2]).toContain("Invalid UNITS");
    });

    it("reports malformed markers and extra text", function () {
        for (const text of [
            "BEGIN:WRONG",
            "BEGIN RECORD",
            "BEGIN:RECORD extra",
            "extra END:RECORD"
        ]) {
            const result = parseRecords(text);

            expect(result.errors.length).toBe(1);
            expect(result.errors[0]).toContain(
                "Line 1: Invalid record marker"
            );
        }
    });

    it("allows colons inside an identifier value", function () {
        const result = parseRecords(makeRecord([
            "IDENTIFIER: urn:uuid:123",
            "TIME: 20250927T100000"
        ]));

        expect(result.errors).toEqual([]);
        expect(result.records[0].IDENTIFIER).toBe("urn:uuid:123");
    });
});

describe("Previously used identifiers", function () {
    it("rejects an identifier listed in the registry", function () {
        const text = makeRecord([
            "IDENTIFIER: existing-001",
            "TIME: 20250927T100000"
        ]);

        const knownIdentifiers = new Set(["existing-001"]);
        const result = parseRecords(text, knownIdentifiers);

        expect(result.errors).toEqual([
            'Line 2: IDENTIFIER "existing-001" ' +
            "already exists in the supplied identifier registry."
        ]);
    });

    it("accepts a new identifier without modifying the registry", function () {
        const text = makeRecord([
            "IDENTIFIER: new-001",
            "TIME: 20250927T100000"
        ]);

        const knownIdentifiers = new Set(["existing-001"]);
        const result = parseRecords(text, knownIdentifiers);

        expect(result.errors).toEqual([]);
        expect([...knownIdentifiers]).toEqual(["existing-001"]);
    });
});
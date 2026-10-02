const { sortRecords } = require("../sortRecords");

describe("Record sorting", function () {
    it("handles an empty array", function () {
        expect(sortRecords([])).toEqual([]);
    });

    it("handles a single record", function () {
        const records = [
            { IDENTIFIER: "A", TIME: "20250927T100000" }
        ];

        expect(sortRecords(records)).toEqual(records);
    });

    it("sorts records across different dates and years", function () {
        const records = [
            { IDENTIFIER: "A", TIME: "20260101T000000" },
            { IDENTIFIER: "B", TIME: "20250927T101530" },
            { IDENTIFIER: "C", TIME: "20240229T120000" },
            { IDENTIFIER: "D", TIME: "20250927T093005" }
        ];

        const result = sortRecords(records);

        expect(result.map(record => record.IDENTIFIER)).toEqual([
            "C", "D", "B", "A"
        ]);
    });

    it("preserves input order when times are equal", function () {
        const records = [
            { IDENTIFIER: "B", TIME: "20250927T100000" },
            { IDENTIFIER: "A", TIME: "20250927T100000" }
        ];

        const result = sortRecords(records);

        expect(result.map(record => record.IDENTIFIER)).toEqual([
            "B", "A"
        ]);
    });

    it("does not change the original array", function () {
        const records = [
            { IDENTIFIER: "later", TIME: "20260101T000000" },
            { IDENTIFIER: "earlier", TIME: "20250101T000000" }
        ];

        const result = sortRecords(records);

        expect(records.map(record => record.IDENTIFIER)).toEqual([
            "later", "earlier"
        ]);
        expect(result.map(record => record.IDENTIFIER)).toEqual([
            "earlier", "later"
        ]);
        expect(result).not.toBe(records);
    });
});
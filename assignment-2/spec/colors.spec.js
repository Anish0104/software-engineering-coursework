const { isValidColor } = require("../colors");

describe("COLOR validation", function () {
    it("accepts recognized names regardless of capitalization", function () {
        expect(isValidColor("blue")).toBeTrue();
        expect(isValidColor("DarkGreen")).toBeTrue();
    });

    it("rejects unknown names", function () {
        expect(isValidColor("notacolor")).toBeFalse();
    });

    it("accepts three-digit and six-digit hex codes", function () {
        expect(isValidColor("#f0A")).toBeTrue();
        expect(isValidColor("#2F54EB")).toBeTrue();
    });

    it("rejects invalid hex digits and lengths", function () {
        expect(isValidColor("#GG0000")).toBeFalse();
        expect(isValidColor("#12345")).toBeFalse();
    });

    it("accepts RGB boundary values and spaces", function () {
        expect(isValidColor("rgb(0, 255, 0)")).toBeTrue();
        expect(isValidColor("RGB(255,128,0)")).toBeTrue();
    });

    it("rejects RGB components outside the range", function () {
        expect(isValidColor("rgb(256, 0, 0)")).toBeFalse();
        expect(isValidColor("rgb(-1, 0, 0)")).toBeFalse();
    });

    it("rejects decimal components and missing components", function () {
        expect(isValidColor("rgb(1.5, 0, 0)")).toBeFalse();
        expect(isValidColor("rgb(0, 0)")).toBeFalse();
    });

    it("reports an invalid color through the record parser", function () {
        const { parseRecords } = require("../records");

        const result = parseRecords([
            "BEGIN:RECORD",
            "IDENTIFIER: color-test",
            "TIME: 20250927T101530",
            "COLOR: rgb(300, 0, 0)",
            "END:RECORD"
        ].join("\n"));

        expect(result.errors.length).toBe(1);
        expect(result.errors[0]).toContain("Line 4: Invalid COLOR");
    });
});
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

describe("Command-line file processing", function () {
    let tempDirectory;
    let inputFile;
    let outputFile;

    const program = path.resolve(__dirname, "../records.js");

    function runProgram(args) {
        return spawnSync(process.execPath, [program, ...args], {
            encoding: "utf8",
            cwd: tempDirectory
        });
    }

    function makeRecord(identifier, time) {
        return [
            "BEGIN:RECORD",
            `IDENTIFIER: ${identifier}`,
            `TIME: ${time}`,
            "END:RECORD"
        ].join("\n");
    }

    beforeEach(function () {
        tempDirectory = fs.mkdtempSync(
            path.join(os.tmpdir(), "records-test-")
        );

        inputFile = path.join(tempDirectory, "input.txt");
        outputFile = path.join(tempDirectory, "output.txt");
    });

    afterEach(function () {
        fs.rmSync(tempDirectory, {
            recursive: true,
            force: true
        });
    });

    it("writes records in chronological order using the required format", function () {
        const later = makeRecord("later", "20260101T000000");
        const earlier = makeRecord("earlier", "20250101T000000");

        fs.writeFileSync(
            inputFile,
            later + "\n\n" + earlier,
            "utf8"
        );

        const result = runProgram([inputFile, outputFile]);

        expect(result.status).toBe(0);

        if (result.status !== 0) {
            fail(result.stderr || "Program did not finish successfully.");
            return;
        }

        expect(fs.readFileSync(outputFile, "utf8")).toBe(
            earlier + "\n\n" + later + "\n"
        );
    });

    it("creates an empty output file for an empty input", function () {
        fs.writeFileSync(inputFile, "", "utf8");

        const result = runProgram([inputFile, outputFile]);

        expect(result.status).toBe(0);

        if (result.status === 0) {
            expect(fs.readFileSync(outputFile, "utf8")).toBe("");
        }
    });

    it("does not create output when validation fails", function () {
        fs.writeFileSync(
            inputFile,
            makeRecord("bad-date", "20250230T120000"),
            "utf8"
        );

        const result = runProgram([inputFile, outputFile]);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain("Invalid TIME");
        expect(fs.existsSync(outputFile)).toBeFalse();
    });

    it("reports a missing input file", function () {
        const result = runProgram([inputFile, outputFile]);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain("Could not read");
        expect(fs.existsSync(outputFile)).toBeFalse();
    });

    it("preserves an existing output file", function () {
        fs.writeFileSync(
            inputFile,
            makeRecord("test-001", "20250927T100000"),
            "utf8"
        );

        fs.writeFileSync(outputFile, "Keep this content.", "utf8");

        const result = runProgram([inputFile, outputFile]);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain("already exists");
        expect(fs.readFileSync(outputFile, "utf8")).toBe(
            "Keep this content."
        );
    });

    it("protects the input when the output path is the same", function () {
        const original = makeRecord(
            "test-001",
            "20250927T100000"
        );

        fs.writeFileSync(inputFile, original, "utf8");

        const result = runProgram([inputFile, inputFile]);

        expect(result.status).toBe(1);
        expect(fs.readFileSync(inputFile, "utf8")).toBe(original);
    });

    it("reports an output path whose parent folder does not exist", function () {
        fs.writeFileSync(
            inputFile,
            makeRecord("test-001", "20250927T100000"),
            "utf8"
        );

        const unavailablePath = path.join(
            tempDirectory,
            "missing-folder",
            "output.txt"
        );

        const result = runProgram([inputFile, unavailablePath]);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain("Could not write");
        expect(fs.existsSync(unavailablePath)).toBeFalse();
    });

    it("prints usage when no input filename is supplied", function () {
        const result = runProgram([]);

        expect(result.status).toBe(1);
        expect(result.stderr).toContain("Usage:");
    });

    it("uses sorted.txt when no output filename is supplied", function () {
        const record = makeRecord(
            "test-001",
            "20250927T100000"
        );

        fs.writeFileSync(inputFile, record, "utf8");

        const result = runProgram([inputFile]);
        const defaultOutput = path.join(tempDirectory, "sorted.txt");

        expect(result.status).toBe(0);

        if (result.status === 0) {
            expect(fs.readFileSync(defaultOutput, "utf8")).toBe(
                record + "\n"
            );
        }
    });
});
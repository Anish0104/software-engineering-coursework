function sortRecords(records) {
    // Copy the array so the original order remains unchanged.
    const sortedRecords = [...records];

    sortedRecords.sort(function (a, b) {
        if (a.TIME < b.TIME) {
            return -1;
        }

        if (a.TIME > b.TIME) {
            return 1;
        }

        return 0;
    });

    return sortedRecords;
}

module.exports = { sortRecords };
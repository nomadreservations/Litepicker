import { DateTimeParser } from "../src/datetime";

// 23 Nov, 2019 - repository creation date
const date = new DateTimeParser(new Date(2019, 10, 23, 0, 0, 0, 0));

const formats = [
    { format: "yyyy-MM-dd", expected: "2019-11-23" },
    { format: "dd/MM/yyyy", expected: "23/11/2019" },
    { format: "d/MM/yyyy", expected: "23/11/2019" },
    { format: "dd.MM.yyyy", expected: "23.11.2019" },
    { format: "yyyy-M-d", expected: "2019-11-23" },
    { format: "d.M.yyyy", expected: "23.11.2019" },
    { format: "dd-MM-yyyy", expected: "23-11-2019" },
    { format: "MM/dd/yyyy", expected: "11/23/2019" },
    { format: "d.MM.yyyy", expected: "23.11.2019" },
    { format: "d/M/yyyy", expected: "23/11/2019" },
    { format: "yyyy年M月d日", expected: "2019年11月23日" },
    { format: "MM-dd-yyyy", expected: "11-23-2019" },
    { format: "dd.MM.yyyy.", expected: "23.11.2019." },
    { format: "yyyy.MM.dd.", expected: "2019.11.23." },
    { format: "३/६/१२", expected: "३/६/१२" },
    { format: "yyyy/MM/dd", expected: "2019/11/23" },
    { format: "H24.MM.dd", expected: "024.11.23" },
    { format: "yyyy. M. d", expected: "2019. 11. 23" },
    { format: "yyyy.M.d", expected: "2019.11.23" },
    { format: "yyyy.d.M", expected: "2019.23.11" },
    { format: "d.M.yyyy.", expected: "23.11.2019." },
    { format: "d-M-yyyy", expected: "23-11-2019" },
    { format: "M/d/yyyy", expected: "11/23/2019" },
    { format: "d/M/2555", expected: "23/11/2555" },
    { format: "๓/๖/๒๕๕๕", expected: "๓/๖/๒๕๕๕" },
    { format: "yyyy/M/d", expected: "2019/11/23" },
];

test("new DateTimeParser", () => {
    const dt1 = new DateTimeParser();
    expect(dt1 instanceof DateTimeParser && !isNaN(dt1.getTime())).toBe(true);

    const dt2 = new DateTimeParser(date);
    expect(
        dt2 instanceof DateTimeParser && date.getTime() === dt2.getTime()
    ).toBe(true);

    const day = date.getDate();
    const month = `0${date.getMonth() + 1}`.slice(-2);
    const year = date.getFullYear();

    const dt3 = new DateTimeParser(`${day}/${month}/${year}`);
    expect(
        dt3 instanceof DateTimeParser && date.getTime() === dt3.getTime()
    ).toBe(false);

    const dt4 = new DateTimeParser(`${day}/${month}/${year}`, "dd/MM/yyyy");
    expect(
        dt4 instanceof DateTimeParser && date.getTime() === dt4.getTime()
    ).toBe(true);
});

test("DateTimeParser.convertArray - lockDays/bookedDays", () => {
    const array = [
        "2019-11-23",
        ["2019-01-01", "2019-01-15"],
        ["2019-11-01", "2019-11-11"],
    ];
    const convertedArray = DateTimeParser.convertArray(array, "YYYY-MM-DD");
    convertedArray.forEach((dt) => {
        if (dt instanceof Array) {
            expect(
                dt[0] instanceof DateTimeParser &&
                    !isNaN(dt[0].getTime()) &&
                    dt[1] instanceof DateTimeParser &&
                    !isNaN(dt[1].getTime())
            ).toBe(true);
        } else {
            expect(dt instanceof DateTimeParser && !isNaN(dt.getTime())).toBe(
                true
            );
        }
    });
    const array2 = [
        new Date("2019-11-23"),
        [new Date("2019-01-01"), new Date("2019-01-15")],
        [new Date("2019-11-01"), new Date("2019-11-11")],
    ];
    const convertedArray2 = DateTimeParser.convertArray(array2, "YYYY-MM-DD");
    convertedArray2.forEach((dt) => {
        if (dt instanceof Array) {
            expect(
                dt[0] instanceof DateTimeParser &&
                    !isNaN(dt[0].getTime()) &&
                    dt[1] instanceof DateTimeParser &&
                    !isNaN(dt[1].getTime())
            ).toBe(true);
        } else {
            expect(dt instanceof DateTimeParser && !isNaN(dt.getTime())).toBe(
                true
            );
        }
    });
});

test("DateTimeParser clone", () => {
    const datetime = new DateTimeParser();
    const clone = datetime.clone();
    expect(datetime.getTime() === clone.getTime()).toBe(true);
});

test("DateTimeParser isBetween", () => {
    const dt1 = new DateTimeParser("2019-11-01", "YYYY-MM-DD");
    const dt2 = new DateTimeParser("2019-11-23", "YYYY-MM-DD");
    const check = new DateTimeParser("2019-11-15", "YYYY-MM-DD");
    const check1 = dt1.clone();
    const check2 = dt2.clone();

    // ()
    expect(check.isBetween(dt1, dt2)).toBe(true);
    expect(check2.isBetween(dt1, dt2)).toBe(false);

    // [)
    expect(check1.isBetween(dt1, dt2, "[)")).toBe(true);

    // (]
    expect(check2.isBetween(dt1, dt2, "(]")).toBe(true);

    // []
    expect(
        check1.isBetween(dt1, dt2, "[]") && check2.isBetween(dt1, dt2, "[]")
    ).toBe(true);
});

test("DateTimeParser isBefore", () => {
    const dt = new DateTimeParser(date);

    // seconds
    dt.setSeconds(dt.getSeconds() - 1);
    expect(dt.isBefore(date)).toBe(true);

    // days
    dt.setDate(dt.getDate() - 1);
    expect(dt.isBefore(date, "day")).toBe(true);

    // months
    dt.setMonth(dt.getMonth() - 1);
    expect(dt.isBefore(date, "month")).toBe(true);
});

test("DateTimeParser isSameOrBefore", () => {
    const dt = new DateTimeParser(date);

    // seconds
    expect(dt.isSameOrBefore(date)).toBe(true);
    dt.setSeconds(dt.getSeconds() - 1);
    expect(dt.isSameOrBefore(date)).toBe(true);

    // days
    expect(dt.isSameOrBefore(date, "day")).toBe(true);
    dt.setDate(dt.getDate() - 1);
    expect(dt.isSameOrBefore(date, "day")).toBe(true);

    // months
    expect(dt.isSameOrBefore(date, "month")).toBe(true);
    dt.setMonth(dt.getMonth() - 1);
    expect(dt.isSameOrBefore(date, "month")).toBe(true);
});

test("DateTimeParser isAfter", () => {
    const dt = new DateTimeParser(date);

    // seconds
    dt.setSeconds(dt.getSeconds() + 1);
    expect(dt.isAfter(date)).toBe(true);

    // days
    dt.setDate(dt.getDate() + 1);
    expect(dt.isAfter(date, "day")).toBe(true);

    // months
    dt.setMonth(dt.getMonth() + 1);
    expect(dt.isAfter(date, "month")).toBe(true);
});

test("DateTimeParser isSameOrAfter", () => {
    const dt = new DateTimeParser(date);

    // seconds
    expect(dt.isSameOrAfter(date)).toBe(true);
    dt.setSeconds(dt.getSeconds() + 1);
    expect(dt.isSameOrAfter(date)).toBe(true);

    // days
    expect(dt.isSameOrAfter(date, "day")).toBe(true);
    dt.setDate(dt.getDate() + 1);
    expect(dt.isSameOrAfter(date, "day")).toBe(true);

    // months
    expect(dt.isSameOrAfter(date, "month")).toBe(true);
    dt.setMonth(dt.getMonth() + 1);
    expect(dt.isSameOrAfter(date, "month")).toBe(true);
});

test("DateTimeParser isSame", () => {
    const dt = new DateTimeParser(date);

    // seconds
    expect(dt.isSameOrAfter(date)).toBe(true);

    // days
    expect(dt.isSameOrAfter(date, "day")).toBe(true);

    // months
    expect(dt.isSameOrAfter(date, "month")).toBe(true);
});

test("DateTimeParser add", () => {
    let dt = null;

    // seconds
    dt = new DateTimeParser(date);
    dt.add(1, "seconds");
    expect(dt.getTime() === date.getTime() + 1000).toBe(true);

    // day
    dt = new DateTimeParser(date);
    dt.add(1, "day");
    expect(dt.getDate() === date.getDate() + 1).toBe(true);

    // month
    dt = new DateTimeParser(date);
    dt.add(1, "month");
    expect(dt.getMonth() === date.getMonth() + 1).toBe(true);
});

test("DateTimeParser subtract", () => {
    let dt = null;

    // seconds
    dt = new DateTimeParser(date);
    dt.subtract(1, "seconds");
    expect(dt.getTime() === date.getTime() - 1000).toBe(true);

    // day
    dt = new DateTimeParser(date);
    dt.subtract(1, "day");
    expect(dt.getDate() === date.getDate() - 1).toBe(true);

    // month
    dt = new DateTimeParser(date);
    dt.subtract(1, "month");
    expect(dt.getMonth() === date.getMonth() - 1).toBe(true);
});

test("DateTimeParser diff", () => {
    let dt = null;

    // seconds
    dt = new DateTimeParser(date);
    dt.add(1, "seconds");
    expect(dt.diff(date) === 1000).toBe(true);

    // day
    dt = new DateTimeParser(date);
    dt.add(1, "day");
    expect(dt.diff(date, "day") === 1).toBe(true);
});

test("DateTimeParser parse fr", () => {
    const may82 = new DateTimeParser(new Date(1982, 4, 25, 0, 0, 0, 0));
    expect(
        new DateTimeParser(
            "mai 25 1982",
            "LLLL dd yyyy",
            "fr-CA"
        ).getDateInstance()
    ).toEqual(may82.getDateInstance());
    expect(
        new DateTimeParser(
            "may 25 1982",
            "LLLL dd yyyy",
            "en-US"
        ).getDateInstance()
    ).toEqual(may82.getDateInstance());
});

test("DateTimeParser format", () => {
    const dt = new DateTimeParser(date);
    for (const format of formats) {
        expect(dt.format(format.format)).toEqual(format.expected);
    }
});

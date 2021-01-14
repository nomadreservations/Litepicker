import { DateTime } from "luxon";
export class DateTimeParser {
    public static parseDateTimeParser(
        date: Date | DateTimeParser | string,
        format: string = "yyyy-MM-dd",
        lang: string = "en-US"
    ): Date {
        if (!date) return new Date(NaN);

        if (date instanceof Date) return new Date(date);
        if (date instanceof DateTimeParser)
            return date.clone().getDateInstance();

        if (/^-?\d{10,}$/.test(date)) {
            return DateTime.fromMillis(Number(date)).toJSDate();
        }

        if (typeof date === "string") {
            const dt = DateTime.fromFormat(date, format, { locale: lang });
            return dt.toJSDate();
        }
        return DateTime.fromMillis(date).toJSDate();
    }

    public static convertArray(
        array: Array<Date | Date[] | string | string[]>,
        format: string
    ): Array<DateTimeParser | DateTimeParser[]> {
        return array.map((d) => {
            if (d instanceof Array) {
                return (d as Array<Date | string>).map(
                    (d1) => new DateTimeParser(d1, format)
                );
            }
            return new DateTimeParser(d, format);
        });
    }

    // replace to regexp lookbehind when most popular browsers will support
    // https://caniuse.com/#feat=js-regexp-lookbehind
    // /(?<!\\)(Y{2,4}|M{1,4}|D{1,2}|d{1,4}])/g
    private static regex: RegExp = /(\\)?(Y{2,4}|M{1,4}|D{1,2}|d{1,4})/g;

    private static readonly MONTH_JS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    private static shortMonths(lang): string[] {
        return DateTimeParser.MONTH_JS.map((x) =>
            new Date(2019, x).toLocaleString(lang, { month: "short" })
        );
    }

    private static longMonths(lang): string[] {
        return DateTimeParser.MONTH_JS.map((x) =>
            new Date(2019, x).toLocaleString(lang, { month: "long" })
        );
    }

    private static formatPatterns(token, lang) {
        switch (token) {
            case "YY":
            case "YYYY":
                return {
                    group: "year",
                    pattern: `(\\d{${token.length}})`,
                };

            case "M":
                return {
                    group: "month",
                    pattern: "(\\d{1,2})",
                };

            case "MM":
                return {
                    group: "month",
                    pattern: "(\\d{2})",
                };

            case "MMM":
                return {
                    group: "shortMonth",
                    pattern: `(${DateTimeParser.shortMonths(lang).join("|")})`,
                };

            case "MMMM":
                return {
                    group: "longMonth",
                    pattern: `(${DateTimeParser.longMonths(lang).join("|")})`,
                };

            case "D":
                return {
                    group: "day",
                    pattern: "(\\d{1,2})",
                };

            case "DD":
                return {
                    group: "day",
                    pattern: "(\\d{2})",
                };
        }
    }

    protected lang: string;

    private dateInstance: Date;

    constructor(
        date: Date | DateTimeParser | string = null,
        format: string = null,
        lang: string = "en-US"
    ) {
        if (format) {
            this.dateInstance = DateTimeParser.parseDateTimeParser(
                date,
                format,
                lang
            );
        } else if (date) {
            this.dateInstance = DateTimeParser.parseDateTimeParser(date);
        } else {
            this.dateInstance = DateTimeParser.parseDateTimeParser(new Date());
        }

        this.lang = lang;
    }

    public getDateInstance(): Date {
        return this.dateInstance;
    }

    public toLocaleString(
        arg0: string,
        arg1: Intl.DateTimeFormatOptions
    ): string {
        return this.dateInstance.toLocaleString(arg0, arg1);
    }

    public toDateString(): string {
        return this.dateInstance.toDateString();
    }

    public getSeconds(): number {
        return this.dateInstance.getSeconds();
    }

    public getDay(): number {
        return this.dateInstance.getDay();
    }

    public getTime(): number {
        return this.dateInstance.getTime();
    }

    public getDate(): number {
        return this.dateInstance.getDate();
    }

    public getMonth(): number {
        return this.dateInstance.getMonth();
    }

    public getFullYear(): number {
        return this.dateInstance.getFullYear();
    }

    public setMonth(arg: number): number {
        return this.dateInstance.setMonth(arg);
    }

    public setHours(
        hours: number = 0,
        minutes: number = 0,
        seconds: number = 0,
        ms: number = 0
    ) {
        this.dateInstance.setHours(hours, minutes, seconds, ms);
    }

    public setSeconds(arg: number): number {
        return this.dateInstance.setSeconds(arg);
    }

    public setDate(arg: number): number {
        return this.dateInstance.setDate(arg);
    }

    public setFullYear(arg: number): number {
        return this.dateInstance.setFullYear(arg);
    }

    public getWeek(firstDay: number): number {
        const target = new Date(this.timestamp());
        const dayNr = (this.getDay() + (7 - firstDay)) % 7;
        target.setDate(target.getDate() - dayNr);
        const startWeekday = target.getTime();
        target.setMonth(0, 1);
        if (target.getDay() !== firstDay) {
            target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
        }
        return 1 + Math.ceil((startWeekday - target.getTime()) / 604800000);
    }

    public clone(): DateTimeParser {
        return new DateTimeParser(this.getDateInstance());
    }

    public isBetween(
        date1: DateTimeParser,
        date2: DateTimeParser,
        inclusivity = "()"
    ): boolean {
        switch (inclusivity) {
            default:
            case "()":
                return (
                    this.timestamp() > date1.getTime() &&
                    this.timestamp() < date2.getTime()
                );

            case "[)":
                return (
                    this.timestamp() >= date1.getTime() &&
                    this.timestamp() < date2.getTime()
                );

            case "(]":
                return (
                    this.timestamp() > date1.getTime() &&
                    this.timestamp() <= date2.getTime()
                );

            case "[]":
                return (
                    this.timestamp() >= date1.getTime() &&
                    this.timestamp() <= date2.getTime()
                );
        }
    }

    public isBefore(date: DateTimeParser, unit = "seconds"): boolean {
        switch (unit) {
            case "second":
            case "seconds":
                return date.getTime() > this.getTime();

            case "day":
            case "days":
                return (
                    new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                    ).getTime() >
                    new Date(
                        this.getFullYear(),
                        this.getMonth(),
                        this.getDate()
                    ).getTime()
                );

            case "month":
            case "months":
                return (
                    new Date(date.getFullYear(), date.getMonth(), 1).getTime() >
                    new Date(this.getFullYear(), this.getMonth(), 1).getTime()
                );

            case "year":
            case "years":
                return date.getFullYear() > this.getFullYear();
        }

        throw new Error("isBefore: Invalid unit!");
    }

    public isSameOrBefore(date: DateTimeParser, unit = "seconds"): boolean {
        switch (unit) {
            case "second":
            case "seconds":
                return date.getTime() >= this.getTime();

            case "day":
            case "days":
                return (
                    new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                    ).getTime() >=
                    new Date(
                        this.getFullYear(),
                        this.getMonth(),
                        this.getDate()
                    ).getTime()
                );

            case "month":
            case "months":
                return (
                    new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        1
                    ).getTime() >=
                    new Date(this.getFullYear(), this.getMonth(), 1).getTime()
                );
        }

        throw new Error("isSameOrBefore: Invalid unit!");
    }

    public isAfter(date: DateTimeParser, unit = "seconds"): boolean {
        switch (unit) {
            case "second":
            case "seconds":
                return this.getTime() > date.getTime();

            case "day":
            case "days":
                return (
                    new Date(
                        this.getFullYear(),
                        this.getMonth(),
                        this.getDate()
                    ).getTime() >
                    new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                    ).getTime()
                );

            case "month":
            case "months":
                return (
                    new Date(this.getFullYear(), this.getMonth(), 1).getTime() >
                    new Date(date.getFullYear(), date.getMonth(), 1).getTime()
                );

            case "year":
            case "years":
                return this.getFullYear() > date.getFullYear();
        }

        throw new Error("isAfter: Invalid unit!");
    }

    public isSameOrAfter(date: DateTimeParser, unit = "seconds"): boolean {
        switch (unit) {
            case "second":
            case "seconds":
                return this.getTime() >= date.getTime();

            case "day":
            case "days":
                return (
                    new Date(
                        this.getFullYear(),
                        this.getMonth(),
                        this.getDate()
                    ).getTime() >=
                    new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                    ).getTime()
                );

            case "month":
            case "months":
                return (
                    new Date(
                        this.getFullYear(),
                        this.getMonth(),
                        1
                    ).getTime() >=
                    new Date(date.getFullYear(), date.getMonth(), 1).getTime()
                );
        }

        throw new Error("isSameOrAfter: Invalid unit!");
    }

    public isSame(date: DateTimeParser, unit = "seconds"): boolean {
        switch (unit) {
            case "second":
            case "seconds":
                return this.getTime() === date.getTime();

            case "day":
            case "days":
                return (
                    new Date(
                        this.getFullYear(),
                        this.getMonth(),
                        this.getDate()
                    ).getTime() ===
                    new Date(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                    ).getTime()
                );

            case "month":
            case "months":
                return (
                    new Date(
                        this.getFullYear(),
                        this.getMonth(),
                        1
                    ).getTime() ===
                    new Date(date.getFullYear(), date.getMonth(), 1).getTime()
                );
        }

        throw new Error("isSame: Invalid unit!");
    }

    public add(duration: number, unit = "seconds"): DateTimeParser {
        switch (unit) {
            case "second":
            case "seconds":
                this.setSeconds(this.getSeconds() + duration);
                break;

            case "day":
            case "days":
                this.setDate(this.getDate() + duration);
                break;

            case "month":
            case "months":
                this.setMonth(this.getMonth() + duration);
                break;
        }

        return this;
    }

    public subtract(duration: number, unit = "seconds"): DateTimeParser {
        switch (unit) {
            case "second":
            case "seconds":
                this.setSeconds(this.getSeconds() - duration);
                break;

            case "day":
            case "days":
                this.setDate(this.getDate() - duration);
                break;

            case "month":
            case "months":
                this.setMonth(this.getMonth() - duration);
                break;
        }

        return this;
    }

    public diff(date: DateTimeParser, unit = "seconds"): number {
        const oneDay = 1000 * 60 * 60 * 24;

        switch (unit) {
            default:
            case "second":
            case "seconds":
                return this.getTime() - date.getTime();

            case "day":
            case "days":
                return Math.round((this.timestamp() - date.getTime()) / oneDay);

            case "month":
            case "months":
            // @TODO
        }
    }

    public format(format: string, lang: string = "en-US"): string {
        return DateTime.fromJSDate(this.dateInstance).toFormat(format, {
            locale: lang,
        });
    }

    private timestamp(): number {
        return new Date(
            this.getFullYear(),
            this.getMonth(),
            this.getDate(),
            0,
            0,
            0,
            0
        ).getTime();
    }
}

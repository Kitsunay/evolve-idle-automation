export class GameUtils {
    private static readonly EXPONENT = new Map([
        ['K', 10 ** 3],
        ['M', 10 ** 6],
        ['B', 10 ** 9]
    ]);

    public static parseFloat(string: string): number {
        string = this.preFormatString(string);

        // Account for percentages
        let isPercentage = string.endsWith('%');

        let number = parseFloat(string);

        if (isPercentage) {
            number = number / 100;
        }

        return this.postFormatNumber(number, string);
    }

    public static parseInt(string: string): number {
        let number = this.parseFloat(string);

        return Math.floor(number);
    }

    private static preFormatString(string: string): string {
        string = string.replace(/\/s/g, ''); // Remove '/s' at the end
        string = string.replace(/\s/g, ''); // Remove whitespaces
        string = string.replace(/\+/g, ''); // Remove '+'

        string = string.replace(',', '.'); // Replace ',' with '.' for numbers like 27,5K to be in parseable format 27.5

        return string;
    }

    private static postFormatNumber(number: number, originalString: string): number {
        let exponentString = originalString.replace(/[0-9.-]%?/g, ''); // Get exponent from string

        let exponent = 1;

        if (exponentString.length > 0) {
            if (this.EXPONENT.has(exponentString)) {
                exponent = this.EXPONENT.get(exponentString) as number;
            } else {
                throw new Error(`Unknown exponent [${exponentString}] on number [${originalString}]`);
            }
        }

        return number * exponent;
    }
}
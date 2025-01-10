export class GameUtils {
    private static readonly EXPONENT = new Map([
        ['K', 10 ** 3],
        ['M', 10 ** 6],
        ['B', 10 ** 9]
    ]);

    /**
     * Utility method that allows reading tooltips without rendering them to the player.
     * @param element element with a tooltip that will experience mouseover/mouseout events to show the tooltip
     * @param tooltipProcessor anonymous function that processes the tooltip, with optional return value
     * @returns whatever the anonymous function parameter returns
     */
    static processTooltip<T>(element: HTMLElement, tooltipProcessor: (tooltipElement: HTMLElement) => T) {
        // This method uses global pop-up to get resource consumption, if a pop-up is displayed, cache it for restore at method end
        let openTooltip = document.querySelector('#popper');
        let cachedElement: Element = undefined;
        if (openTooltip) {
            let cachedId = openTooltip.getAttribute('data-id');
            
            if (cachedId.startsWith('popGenetrait')) { // Gene trait tooltip is no work
                cachedId = cachedId.replace('popGenetrait', '');
                cachedElement = document.querySelector(`#arpaGenetics .trait.t-${cachedId} :nth-child(2)`);
            } else {
                cachedElement = document.querySelector(`[id*="${cachedId}"]`); // Standard tooltip behaviour
                console.log(cachedId, cachedElement);
            }

            if (!cachedElement) {
                console.log('Failed to find cached tooltip element', openTooltip, cachedId);
            }

            let jobLabel = cachedElement.querySelector('.job_label');
            if (jobLabel) { // Jobs have borked tooltip event listeners
                cachedElement = jobLabel;
            }

            if (cachedElement.classList.contains('race')) { // Race tooltip is borked, too
                cachedElement = cachedElement.querySelector<HTMLElement>('.name');
            }

            if (cachedElement.classList.contains('city') || cachedElement.classList.contains('space')) { // District names are also borked
                cachedElement = cachedElement.querySelector<HTMLElement>('h3');
            }

            cachedElement.dispatchEvent(new Event('mouseout'));
        }

        // The popup exists for such a short amount of time, it doesn't even render and the player won't see any flickering tooltips
        element.dispatchEvent(new Event('mouseover')); // Simulate mouseover to display tooltip
        let tooltip = document.querySelector<HTMLElement>(`#popper`); // Read pop-up tooltip
        let result = tooltipProcessor(tooltip);
        element.dispatchEvent(new Event('mouseout')); // Simulate mouseout to hide the tooltip

        if (cachedElement) {
            cachedElement.dispatchEvent(new Event('mouseover')); // Restore the original tooltip
        }

        return result;
    }

    public static parseFloat(string: string): number {
        if (!string) {
            return 0;
        }
        
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
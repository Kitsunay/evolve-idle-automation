export class Power {
    public static readonly id = 'power';
    public static readonly mainElement = document.querySelector<HTMLElement>('#race .power');

    /**
     * Returns the current amount of free power
     */
    public static get count(): number {
        return parseInt(this.mainElement.querySelector<HTMLElement>('#powerMeter').textContent.trim());
    }
}
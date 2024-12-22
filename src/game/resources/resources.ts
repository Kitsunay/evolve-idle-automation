export class Resources {

    public static get populationResourceId(): string {
        let raceName = document.querySelector('#race .name').textContent.toLowerCase();

        return `res${raceName}`;
    }

    public static getCount(resourceId: string): number {
        // Return value visible in the left sidebar
        let countString = document.querySelector(`#${resourceId} .count`).textContent;

        // If has max, return only count (e.g. from string 3 / 15 return only 3)
        if (countString.indexOf('/') < 0) {
            countString = countString.substring(0, countString.indexOf('/'));
        }

        return parseInt(countString);
    }

    public static getMaxCount(resourceId: string): number {
        // Return value visible in the left sidebar
        let countString = document.querySelector(`#${resourceId} .count`).textContent;

        // If has max, return only max (e.g. from string 3 / 15 return only 15), otherwise return undefined
        if (countString.indexOf('/') < 0) {
            return undefined;
        }

        countString = countString.substring(countString.indexOf('/') + 1);
        return parseInt(countString);
    }

    public static getConsumption(resourceId: string): number {
        // This method uses global pop-up to get resource consumption, if a pop-up is displayed, cache it for restore at method end
        let openTooltip = document.querySelector('#popper');
        let cachedElement: Element = undefined;
        if (openTooltip) {
            let cachedId = openTooltip.getAttribute('data-id');
            cachedElement = document.querySelector<HTMLElement>(`#${cachedId}`);

            let jobLabel = cachedElement.querySelector('.job_label');
            if (jobLabel) { // Jobs have borked tooltip event listeners
                cachedElement = jobLabel;
            }

            document.querySelector(`#${cachedId}`).dispatchEvent(new Event('mouseout'));
        }

        // The popup exists for such a short amount of time, it doesn't even render and the player won't see any flickering tooltips

        document.querySelector(`#${resourceId} .diff`).dispatchEvent(new Event('mouseover')); // Simulate mouseover to display tooltip
        let consumptionElements = document.querySelectorAll('#popper .resBreakdown .parent > div:nth-child(2) .modal_bd > :nth-child(2)'); // Read pop-up tooltip
        document.querySelector(`#${resourceId} .diff`).dispatchEvent(new Event('mouseout')); // Simulate mouseout to hide the tooltip

        if (cachedElement) {
            cachedElement.dispatchEvent(new Event('mouseover')); // Restore the original tooltip
        }

        let consumption = 0;
        for (let i = 0; i < consumptionElements.length; i++) {
            const element = consumptionElements[i];
            consumption += parseFloat(element.textContent);
        }

        return consumption;
    }

    public static getProduction(resourceId: string): number {
        return parseFloat(document.querySelector(`#${resourceId} .diff`).textContent);
    }

    public static getTotalProduction(resourceId: string): number {
        return this.getProduction(resourceId) - this.getConsumption(resourceId);
    }
}
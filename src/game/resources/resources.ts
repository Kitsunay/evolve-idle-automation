import { GameUtils } from "../game-utils";
import { Power } from "./power";

export class Resources {
    public static readonly Power = Power;

    public static get populationResourceId(): string {
        return document.querySelector('#resMoney + *').id;
    }

    public static getCount(resourceId: string): number {
        // Fix for market resources
        resourceId = this.fixResourceId(resourceId);

        // Return value visible in the left sidebar
        let countString = document.querySelector(`#${resourceId} .count`).textContent;

        // If has max, return only count (e.g. from string 3 / 15 return only 3)
        if (countString.indexOf('/') >= 0) {
            countString = countString.substring(0, countString.indexOf('/'));
        }

        return GameUtils.parseInt(countString);
    }

    public static getMaxCount(resourceId: string): number {
        // Fix for market resources
        resourceId = this.fixResourceId(resourceId);

        // Return value visible in the left sidebar
        let countString = document.querySelector(`#${resourceId} .count`).textContent;

        // If has max, return only max (e.g. from string 3 / 15 return only 15), otherwise return undefined
        if (countString.indexOf('/') < 0) {
            return undefined;
        }

        countString = countString.substring(countString.indexOf('/') + 1);
        let maxCount = GameUtils.parseInt(countString);

        return maxCount;
    }

    public static getConsumptionBreakdown(resourceId: string): {name: string, amount: number}[] {
        return this.getBreakdown(resourceId, 'consumption');
    }

    public static getConsumption(resourceId: string): number {
        let consumptionBreakdown = this.getConsumptionBreakdown(resourceId);
        return consumptionBreakdown.reduce((previousValue, currentValue) => previousValue + currentValue.amount, 0);
    }

    static getProductionBreakdown(resourceId: string) {
        return this.getBreakdown(resourceId, 'production');
    }

    public static getProduction(resourceId: string): number {
        // Fix for market resources
        resourceId = this.fixResourceId(resourceId);

        return GameUtils.parseFloat(document.querySelector(`#${resourceId} .diff`).textContent);
    }

    public static getTotalProduction(resourceId: string): number {
        // Fix for market resources
        resourceId = this.fixResourceId(resourceId);

        return this.getProduction(resourceId) - this.getConsumption(resourceId);
    }

    private static fixResourceId(resourceId: string): string {
        return resourceId.replace('market-', 'res');
    }

    private static getBreakdown(resourceId: string, selector: 'production' | 'consumption') {
        // Fix for market resources
        resourceId = this.fixResourceId(resourceId);

        // This method uses global pop-up to get resource consumption, if a pop-up is displayed, cache it for restore at method end
        let openTooltip = document.querySelector('#popper');
        let cachedElement: Element = undefined;
        if (openTooltip) {
            let cachedId = openTooltip.getAttribute('data-id');
            cachedElement = document.querySelector(`[id*="${cachedId}"]`);

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

            if (cachedElement.classList.contains('city')) { // District names are also borked
                cachedElement = cachedElement.querySelector<HTMLElement>('h3');
            }

            cachedElement.dispatchEvent(new Event('mouseout'));
        }

        // Prepare to select the correct element based on the selector
        let childIndex: number;
        if (selector === 'production') {
            childIndex = 1;
        } else if (selector === 'consumption') {
            childIndex = 2;
        }

        // The popup exists for such a short amount of time, it doesn't even render and the player won't see any flickering tooltips
        document.querySelector(`#${resourceId} .diff`).dispatchEvent(new Event('mouseover')); // Simulate mouseover to display tooltip
        let consumptionElements = document.querySelectorAll(`#popper .resBreakdown .parent > div:nth-child(${childIndex}) .modal_bd`); // Read pop-up tooltip
        document.querySelector(`#${resourceId} .diff`).dispatchEvent(new Event('mouseout')); // Simulate mouseout to hide the tooltip

        if (cachedElement) {
            cachedElement.dispatchEvent(new Event('mouseover')); // Restore the original tooltip
        }

        let consumptionBreakdown = [];
        for (let i = 0; i < consumptionElements.length; i++) {
            const element = consumptionElements[i];

            let nameElement = element.children.item(0);
            let amountElement = element.children.item(1);

            consumptionBreakdown.push({name: nameElement.textContent, amount: GameUtils.parseFloat(amountElement.textContent)});
        }

        return consumptionBreakdown;
    }
}
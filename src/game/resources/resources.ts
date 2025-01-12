import { Clicker } from "../clicker";
import { GameUtils } from "../game-utils";
import { Power } from "./power";

export class Resources {
    public static readonly Power = Power;

    public static get gatherableResources(): string[] {
        let resourceGatherButtons = document.querySelectorAll<Element>("#city .action a.button:not([class*=res-])");

        // Resource id is present in parent
        let resources = Array.from(resourceGatherButtons).map((element) => element.parentElement.id.replace('city-', 'res'));

        return resources;
    }

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

    public static getConsumptionBreakdown(resourceId: string): { name: string, amount: number }[] {
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

        return GameUtils.parseFloat(document.querySelector(`#${resourceId} .diff`)?.textContent);
    }

    public static getTotalProduction(resourceId: string): number {
        // Fix for market resources
        resourceId = this.fixResourceId(resourceId);

        return this.getProduction(resourceId) - this.getConsumption(resourceId);
    }

    private static fixResourceId(resourceId: string): string {
        resourceId = resourceId.replace('market-', 'res');

        if (!resourceId.startsWith('res')) {
            resourceId = 'res' + resourceId;

            resourceId = `${resourceId.substring(0, 3)}${resourceId[3].toUpperCase()}${resourceId.substring(4)}`;
        }

        if (resourceId === 'resLux') { // Luxury items are practically money
            resourceId = 'resMoney';
        }

        if (resourceId === 'resNano') { // Market uses difference
            resourceId = 'resNano_Tube';
        }

        return resourceId;
    }

    private static getBreakdown(resourceId: string, selector: 'production' | 'consumption') {
        // Fix for market resources
        resourceId = this.fixResourceId(resourceId);

        // Prepare to select the correct element based on the selector
        let childIndex: number;
        if (selector === 'production') {
            childIndex = 1;
        } else if (selector === 'consumption') {
            childIndex = 2;
        }

        let consumptionElements = GameUtils.processTooltip(document.querySelector(`#${resourceId} .diff`), (tooltipElement) => {
            return tooltipElement.querySelectorAll(`.resBreakdown .parent > div:nth-child(${childIndex}) .modal_bd`);
        });

        let consumptionBreakdown = [];
        for (let i = 0; i < consumptionElements.length; i++) {
            const element = consumptionElements[i];

            let nameElement = element.children.item(0);
            let amountElement = element.children.item(1);

            consumptionBreakdown.push({ name: nameElement.textContent, amount: GameUtils.parseFloat(amountElement.textContent) });
        }

        return consumptionBreakdown;
    }

    public static tryGather(resourceId: string): boolean {
        let resourceButtonId = resourceId.replace('res', 'city-');
        let buttonElement = document.querySelector<Element>(`#${resourceButtonId} a.button`);

        if (!buttonElement) {
            return false;
        }

        Clicker.click(buttonElement);
        return true;
    }
}
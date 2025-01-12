import { Game } from "../game";
import { GameUtils } from "../game-utils";

export class BuildingItem {
    public readonly buildingId: string;
    public readonly mainElement: HTMLElement;
    private _powerElement: HTMLElement | null | undefined; // Cached value, undefined if not yet calculated, null if it doesn't exist

    private get powerElement(): HTMLElement | null {
        if (this._powerElement === undefined) {
            this._powerElement = Game.PowerGrid.getBuildingElement(this.buildingId);
        }

        return this._powerElement;
    }

    public get fullName(): string {
        // Read fully qualified name from power grid element
        let powerElement = this.powerElement;

        if (!powerElement) {
            return undefined;
        }

        return powerElement.querySelector<HTMLElement>('.has-text-warning').textContent;
    }

    public get activeCount(): number {
        let powerElement = this.powerElement;

        if (!powerElement) {
            return 0;
        }

        let onElement = powerElement.querySelector<HTMLElement>('.on');
        return onElement ? parseInt(onElement.textContent) : 0;
    }

    public get inactiveCount(): number {
        let powerElement = this.powerElement;

        if (!powerElement) {
            return 0;
        }

        let offElement = powerElement.querySelector<HTMLElement>('.off');
        return offElement ? parseInt(offElement.textContent) : 0;
    }

    public get powerConsumption(): number {
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

        // The popup exists for such a short amount of time, it doesn't even render and the player won't see any flickering tooltips

        document.querySelector(`#${this.buildingId}`).dispatchEvent(new Event('mouseover')); // Simulate mouseover to display tooltip
        let consumptionElements = document.querySelectorAll('#popper .has-text-caution'); // Read pop-up tooltip
        document.querySelector(`#${this.buildingId}`).dispatchEvent(new Event('mouseout')); // Simulate mouseout to hide the tooltip

        if (cachedElement) {
            cachedElement.dispatchEvent(new Event('mouseover')); // Restore the original tooltip
        }

        let consumption: number = undefined;
        for (let i = 0; i < consumptionElements.length; i++) {
            const element = consumptionElements[i];

            // Try to parse out the energy consumption value, which is in format "+-124MW" "\+?\-?(\d+)MW"
            let match = element.textContent.match(/\+?\-?(\d+)MW/);
            if (match) {
                // Safety check: throw error if consumption has already been found
                if (consumption !== undefined) {
                    throw new Error(`Power consumption already found on building [${this.buildingId}]. Values: ${consumption}, ${match[1]}`);
                }

                consumption = GameUtils.parseFloat(match[1]);
            }
        }

        // Safety check: throw error if consumption has not been found
        if (consumption === undefined) {
            throw new Error(`Power consumption not found on building [${this.buildingId}]`);
        }

        return consumption;
    }

    public get isElectrified(): boolean {
        return this.powerElement !== null && !this.powerElement.classList.contains('inactive');
    }

    get buyButtonElement(): HTMLElement {
        return this.mainElement.querySelector<HTMLElement>('.button');
    }

    public get activateElement(): HTMLElement {
        return this.mainElement.querySelector<HTMLElement>('span.on');
    }

    public get deactivateElement(): HTMLElement {
        return this.mainElement.querySelector<HTMLElement>('span.off');
    }

    get isVisible(): boolean {
        return this.mainElement && this.buyButtonElement && this.buyButtonElement.style.display !== 'none';
    }

    get isPurchasable(): boolean {
        if (!this.isVisible) { // If the building is not unlocked yet, it cant be purchased
            return false;
        }

        // cna - can not afford, cnam - can not afford due to max capacity
        return !(this.mainElement.classList.contains('cna') || this.mainElement.classList.contains('cnam'));
    }

    /**
     * Returns true if the building can become purchasable with current storage capacity
     */
    get isCostStorageable(): boolean {
        if (!this.isVisible) { // If the building is not unlocked yet, it cant be purchased
            return false;
        }

        // cnam - can not afford due to max capacity
        return !this.mainElement.classList.contains('cnam');
    }

    /**
     * Returns number of purchased buildings
     */
    get level(): number {
        if (!this.isVisible) {
            return 0;
        }
        
        let countString = this.mainElement.querySelector<HTMLElement>('.count').textContent;

        return parseInt(countString);
    }

    public static fromElement<T = BuildingItem>(this: { new(buildingId: string, element: HTMLElement): T }, element: HTMLElement): T {
        return new this(undefined, element);
    }

    public static fromId<T = BuildingItem>(this: { new(buildingId: string, element: HTMLElement): T }, buildingId: string): T {
        return new this(buildingId, undefined);
    }

    constructor(buildingId: string = undefined, element: HTMLElement = undefined) {
        if (element) {
            this.mainElement = element;
            this.buildingId = element.id;
        } else {
            this.buildingId = buildingId;
            this.mainElement = document.querySelector<HTMLElement>(`#${buildingId}`);
        }
    }
}
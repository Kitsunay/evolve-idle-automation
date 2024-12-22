export class BuildingItem {
    public readonly buildingId: string;
    public readonly mainElement: HTMLElement;

    get buyButtonElement(): HTMLElement {
        return this.mainElement.querySelector<HTMLElement>('.button');
    }

    get isPurchasable(): boolean {
        // cna - can not afford, cnam - can not afford due to max capacity
        return !(this.mainElement.classList.contains('cna') || this.mainElement.classList.contains('cnam'));
    }

    /**
     * Returns number of purchased buildings
     */
    get count(): number {
        let countString = this.mainElement.querySelector<HTMLElement>('.count').textContent;

        return parseInt(countString);
    }

    public static fromElement<T = BuildingItem>(this: {new(buildingId: string, element: HTMLElement): T}, element: HTMLElement): T {
        return new this(undefined, element);
    }

    public static fromId<T = BuildingItem>(this: {new(buildingId: string, element: HTMLElement): T}, buildingId: string): T {
        return new this(buildingId, undefined);
    }

    constructor(buildingId: string = undefined, element: HTMLElement = undefined) {
        if (element) {
            this.mainElement = element;
            this.buildingId = element.id;
            return;
        }

        if (buildingId) {
            this.buildingId = buildingId;
            this.mainElement = document.querySelector<HTMLElement>(`#${buildingId}`);
        }
    }
}
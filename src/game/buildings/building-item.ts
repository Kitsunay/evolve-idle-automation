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

    constructor(buildingId: string) {
        this.buildingId = buildingId;

        this.mainElement = document.querySelector<HTMLElement>(`#${this.buildingId}`);
    }
}
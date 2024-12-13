export class Building {
    public readonly buildingId: string;

    get mainElement(): Element {
        return document.querySelector<HTMLElement>(`#${this.buildingId}`);
    }

    get buyButtonElement(): Element {
        return document.querySelector<HTMLElement>(`#${this.buildingId} .button`);
    }

    get isPurchasable(): boolean {
        let mainElement = this.mainElement;

        // cna - can not afford, cnam - can not afford due to max capacity
        return !mainElement.classList.contains('cna') && !mainElement.classList.contains('cnam');
    }

    constructor(buildingId: string) {
        this.buildingId = buildingId;
    }

    public tryBuy(): boolean {
        if (!this.isPurchasable) {
            return false;
        }

        let buyButtonElement = this.buyButtonElement;

        return buyButtonElement.dispatchEvent(new Event('click'));
    }
}
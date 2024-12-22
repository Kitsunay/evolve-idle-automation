export class StorageAssignmentItem {
    public readonly storageItemName: string;
    public readonly resourceId: string;
    public readonly element: HTMLElement;

    public get count(): number {
        return parseInt(this.element.querySelector<HTMLElement>('.current').textContent);
    }

    public get addButton(): HTMLElement {
        return this.element.querySelector<HTMLElement>('.add');
    }

    public get subButton(): HTMLElement {
        return this.element.querySelector<HTMLElement>('.sub');
    }

    constructor(storageItemName: string, resourceId: string) {
        this.storageItemName = storageItemName;
        this.resourceId = resourceId;

        let resourceRowElement = document.querySelector<HTMLElement>(`#resStorage #${this.resourceId}:not([style="display: none;"`);

        if (!resourceRowElement) {
            throw new Error(`Cannot create assignment for non-existent resource [${this.resourceId}] for storage item [${this.storageItemName}]`);
        }

        // Move element down to the correct .trade element (there are multiple .trade elements, one for each storage item)
        let tradeElements = resourceRowElement.querySelectorAll<HTMLElement>('.trade');

        let tradeElement = Array.from(tradeElements).filter((element) => element.firstChild.textContent.toLowerCase() === this.storageItemName)?.[0];
        
        this.element = tradeElement;
    }
}
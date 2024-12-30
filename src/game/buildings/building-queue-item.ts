export class BuildingQueueItem {
    /**
     * The root HTML element of queue item
     */
    private readonly element: HTMLElement

    constructor(element: HTMLElement) {
        this.element = element;
    }

    /**
     * Returns the clickable element of this queue item.
     */
    public get buttonElement(): HTMLElement {
        return this.element.querySelector<HTMLElement>('a');
    }
}
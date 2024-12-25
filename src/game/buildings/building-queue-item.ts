export class BuildingQueueItem {
    /**
     * The root HTML element of queue item
     */
    private readonly element: HTMLElement

    constructor(element: HTMLElement) {
        this.element = element;
    }
}
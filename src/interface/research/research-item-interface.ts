export class ResearchItemInterface {
    public readonly rootElement: HTMLElement

    constructor(rootElement: HTMLElement) {
        this.rootElement = rootElement;
    }

    /**
     * Adds an event listener to the root element
     * @param eventType name of the event
     * @param callback function to be called on the event
     */
    public addEventListener(eventType: string, callback: () => void) {
        this.rootElement.addEventListener(eventType, callback);
    }
}
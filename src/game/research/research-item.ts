export class ResearchItem {
    public readonly element: HTMLElement
    
    constructor(rootElement: HTMLElement) {
        this.element = rootElement;
    }
    
    public get id(): string {
        return this.element.getAttribute('id');
    }

    public get name(): string {
        return this.element.querySelector<HTMLElement>('.aTitle').textContent;
    }
    
    get buyButtonElement(): HTMLElement {
        return this.element.querySelector<HTMLElement>('.button');
    }
    
    public get isPurchasable(): boolean {
        // cna - can not afford, cnam - can not afford due to max capacity
        return !(this.element.classList.contains('cna') || this.element.classList.contains('cnam'));
    }

    /**
     * Adds an event listener to the root element
     * @param eventType name of the event
     * @param callback function to be called on the event
     */
    public addEventListener(eventType: string, callback: () => void) {
        this.element.addEventListener(eventType, callback);
    }
}

export class ResearchItem {
    public readonly researchId: string;
    
    public readonly element: HTMLElement;
    
    get buyButtonElement(): HTMLElement {
        return this.element.querySelector<HTMLElement>('.button');
    }
    
    constructor(researchId: string) {
        this.researchId = researchId;
        
        this.element = document.querySelector<HTMLElement>(`#tech #${this.researchId}`);
    }

    public isPurchasable(): boolean {
        // cna - can not afford, cnam - can not afford due to max capacity
        return !(this.element.classList.contains('cna') || this.element.classList.contains('cnam'));
    }
}

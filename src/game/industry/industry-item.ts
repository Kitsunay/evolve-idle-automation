export abstract class IndustryItem {
    public readonly subButton: HTMLElement;
    public readonly addButton: HTMLElement;
    public readonly textContentElement: HTMLElement;

    public abstract get resourceId(): string;

    public get count(): number {
        let countString = this.textContentElement.textContent.match(/\d+/)[0];
        return parseInt(countString);
    }

    public constructor(components: {subButton: HTMLElement, addButton: HTMLElement, textContentElement: HTMLElement}) {
        this.subButton = components.subButton;
        this.addButton = components.addButton;
        this.textContentElement = components.textContentElement;
    }
}
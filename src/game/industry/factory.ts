import { GameUtils } from "../game-utils";
import { FactoryItem } from "./factory-item";

export class Factory {
    private static get element(): HTMLElement {
        return document.querySelector<HTMLElement>('#iFactory');
    }

    private static get exists(): boolean {
        return !!this.element;
    }

    private static get outputItemElements(): HTMLElement[] {
        if (!this.exists) {
            return [];
        }
        
        return Array.from(this.element.querySelectorAll<HTMLElement>('.factory'));
    }

    public static get countMax(): number {
        let textElement = this.element.querySelector<HTMLElement>(':scope > div:nth-child(2) > span:nth-child(2)');

        let [min, max] = textElement.textContent.split('/');

        return GameUtils.parseInt(max);
    }

    public static get outputItems(): FactoryItem[] {
        let fuelItems = this.buildFactoryItems(Array.from(this.outputItemElements));

        return fuelItems;
    }

    private static buildFactoryItems(elements: HTMLElement[]): FactoryItem[] {
        let result = [];
    
        for (const element of elements) {
            let subElement = element.querySelector<HTMLElement>('.sub');
            let textContentElement = element.querySelector<HTMLElement>('.current');
            let addElement = element.querySelector<HTMLElement>('.add');

            result.push(new FactoryItem({subButton: subElement, addButton: addElement, textContentElement: textContentElement}));
        }

        return result;
    }
}
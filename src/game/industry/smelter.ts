import { Game } from "../game";
import { IndustryItem } from "./industry-item";
import { SmelterItem } from "./smelter-item";

export class Smelter {
    public static get element(): HTMLElement {
        return document.querySelector<HTMLElement>('#iSmelter');
    }

    public static get fuelRootElement(): HTMLElement {
        return this.element?.querySelector<HTMLElement>('[id*="Fuels"]');
    }

    public static get outputRootElement(): HTMLElement {
        return this.element?.querySelector<HTMLElement>('[id*="Mats"]');
    }

    public static get exists(): boolean {
        return !!this.element;
    }

    public static get count(): number {
        return Game.Buildings.getBuilding('city-smelter').count;
    }

    public static get fuelItems(): SmelterItem[] {
        if (!this.fuelRootElement) {
            return [];
        }
        
        let elements = this.fuelRootElement.querySelectorAll<HTMLElement>(':scope > *');

        let fuelItems = this.buildSmelterItems(Array.from(elements));

        return fuelItems;
    }

    public static get outputItems(): SmelterItem[] {
        if (!this.outputRootElement) {
            return [];
        }

        let elements = this.outputRootElement.querySelectorAll<HTMLElement>('.fuels > *')

        let outputItems = this.buildSmelterItems(Array.from(elements));

        return outputItems;
    }

    static addIndustryItem(item: IndustryItem): void {
        item.addButton.dispatchEvent(new Event('click'));
    }

    static subIndustryItem(item: IndustryItem): void {
        item.subButton.dispatchEvent(new Event('click'));
    }

    private static buildSmelterItems(elements: HTMLElement[]): SmelterItem[] {
        let result: SmelterItem[] = [];
        
        // The elements for each fuel item are flattened
        // Collect fuel item parts, while ignoring extra elements
        let subElement: HTMLElement;
        let textElement: HTMLElement;
        let addElement: HTMLElement;

        for (let i = 0; i < elements.length; i++) {
            if (elements[i].classList.contains('sub')) {
                subElement = elements[i];
            } else if (elements[i].classList.contains('current')) {
                textElement = elements[i];
            } else if (elements[i].classList.contains('add')) {
                addElement = elements[i];
                
                // .add is the right-most element, when found we have a complete fuel item
                result.push(new SmelterItem({subButton: subElement, addButton: addElement, textContentElement: textElement}));

                subElement = undefined;
                textElement = undefined;
                addElement = undefined;
            }
        }

        return result;
    }
}
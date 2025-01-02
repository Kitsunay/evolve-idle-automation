import { GameUtils } from "../game-utils";
import { IndustryItem } from "./industry-item";

export class SmelterItem extends IndustryItem {
    public get resourceId(): string {
        // Get element with resource as class
        let element = this.textContentElement;
        
        // Extract the class masked as resource id
        for (let i = 0; i < element.classList.length; i++) {
            const className = element.classList[i];
            
            if (className === 'current') { // Filter out known non-resource classes
                continue;
            }
            
            return className;
        }
        
        throw new Error(`Cannot find resource id for smelter item [${this}]`);
    }

    public get consumptionPerSmelter(): number {
        let tooltipText = GameUtils.processTooltip(this.textContentElement, (tooltipElement) => {
            return tooltipElement.textContent;
        });

        let consumption = tooltipText.match(/\d+\.?\d*/)[0];
        return parseFloat(consumption);
    }
}
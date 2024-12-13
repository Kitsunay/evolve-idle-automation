import { Interface } from "../interface";

export class AutoBuildingInterface {

    static init() {
        this.refresh();
    }

    static refresh() {
        //this.refreshBuilding('city-basic_housing', true);
    }

    static refreshBuildingInterface(buildingId: string, enabled: boolean, onToggle: () => void) {
        let autoBuildingElement: Element = document.querySelector<HTMLElement>(`#${buildingId} .auto-building`);
        let buildingElement = document.querySelector<HTMLElement>(`#${buildingId}`);
        
        // Create the element if it doesn't exist exists
        if (!autoBuildingElement && buildingElement) {
            let autoBuildingElementString = `<div class="auto-building"><span>Auto-Building</span></div>`;
            autoBuildingElement = Interface.createElementFromString(autoBuildingElementString, buildingElement, 0);
            autoBuildingElement.addEventListener('click', onToggle);
        }

        // Update element's value (on/off)
        if (autoBuildingElement.classList.contains('on') !== enabled) {
            autoBuildingElement.classList.toggle('on');
        }
    }
}
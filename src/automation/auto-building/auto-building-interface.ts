import { ToggleButton } from "../../interface/components/toggle-button/toggle-button";
import { Interface } from "../../interface/interface";

export class AutoBuildingInterface {
    static init() {
        this.refresh();
    }

    static refresh() {
        //this.refreshBuilding('city-basic_housing', true);
    }

    static refreshBuildingInterface(buildingId: string, enabled: boolean, paused: boolean, onToggle: () => void) {
        let buildingElement = document.querySelector<HTMLElement>(`#${buildingId}`);

        // Skip if building element does not exist
        if (!buildingElement) {
            return;
        }
        
        let toggleButton = ToggleButton.getOrCreate(`auto_building_toggle_${buildingId}`, buildingElement, { styleClass: "auto-building", textContent: {on: "Auto: ON", off: "Auto: OFF"}, position: 0});
        toggleButton.onToggle = onToggle;
        toggleButton.isToggled = enabled;

        if (toggleButton.buttonElement.classList.contains('paused') !== paused) {
            toggleButton.buttonElement.classList.toggle('paused');
        }
    }

    static refreshPauseButton(paused: boolean, onToggle: () => void) {
        let buildingRootElement = document.querySelector<HTMLElement>(`#city`);
        
        if (!buildingRootElement) {
            return;
        }

        let pauseElementId = `auto_building_toggle_pause`;
        
        // Create the element if it doesn't exist
        let toggleButton = ToggleButton.getOrCreate(pauseElementId, buildingRootElement, { styleClass: "auto-building pause-button", textContent: {on: "Paused", off: "Pause"}, position: 0});
        toggleButton.onToggle = onToggle;
        toggleButton.isToggled = paused;

        // Also make sure 'Automation' label is rendered
        if (!document.querySelector<HTMLElement>(`#auto-building-label`)) {
            let autoBuildingLabelElementString = `<div id="auto-building-label"><h3 class="name has-text-warning">Automation</h3></div>`;
            Interface.createChildElementFromString(autoBuildingLabelElementString, buildingRootElement, 0);
        }
    }
}
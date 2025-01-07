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
        
        let toggleButton = new ToggleButton(`auto_building_toggle_${buildingId}`, buildingElement, 0);
        toggleButton.createOrUpdate({ styleClass: `auto-building${paused ? ' paused' : ''}`, textContent: {on: "Auto: ON", off: "Auto: OFF"}, position: 0, onToggle: onToggle, isToggled: enabled });
    }

    static refreshPauseButton(paused: boolean, onToggle: () => void) {
        let buildingRootElement = document.querySelector<HTMLElement>(`#city`);
        
        if (!buildingRootElement) {
            return;
        }

        let pauseElementId = `auto_building_toggle_pause`;
        
        // Create the element if it doesn't exist
        let toggleButton = new ToggleButton(pauseElementId, buildingRootElement, 0);
        toggleButton.createOrUpdate({ styleClass: "auto-building pause-button", textContent: {on: "Paused", off: "Pause"}, position: 0, isToggled: paused, onToggle: onToggle });

        // Also make sure 'Automation' label is rendered
        if (!document.querySelector<HTMLElement>(`#auto-building-label`)) {
            let autoBuildingLabelElementString = `<div id="auto-building-label"><h3 class="name has-text-warning">Automation</h3></div>`;
            Interface.createChildElementFromString(autoBuildingLabelElementString, buildingRootElement, 0);
        }
    }
}
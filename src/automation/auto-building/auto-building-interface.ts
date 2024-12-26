import { ToggleButton } from "../../interface/components/toggle-button/toggle-button";
import { Interface } from "../../interface/interface";

export class AutoBuildingInterface {

    static init() {
        this.refresh();
    }

    static refresh() {
        //this.refreshBuilding('city-basic_housing', true);
    }

    static refreshBuildingInterface(buildingId: string, enabled: boolean, onToggle: () => void) {
        let buildingElement = document.querySelector<HTMLElement>(`#${buildingId}`);

        // Skip if building element does not exist
        if (!buildingElement) {
            return;
        }
        
        let toggleButton = ToggleButton.createIfNotExists(`auto_building_toggle_${buildingId}`, buildingElement, { styleClass: "auto-building", textContent: {on: "Auto: ON", off: "Auto: OFF"}, position: 0});
        toggleButton.onToggle = onToggle;
        toggleButton.isToggled = enabled;
    }
}
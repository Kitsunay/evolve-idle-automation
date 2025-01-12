import { ToggleButton } from "../../interface/components/toggle-button/toggle-button";
import { AutoStartState } from "./auto-start-state";

export class AutoStartInterface {
    public static update(
        state: AutoStartState,
        callbacks: {
            onEnableButtonToggle: () => void
        }
    ) {
        let buildingRootElement = document.querySelector<HTMLElement>(`#city`);

        if (!buildingRootElement) {
            console.debug('building root #city does not exist');
            return;
        }

        let enabledElementId = `auto_start_toggle`;

        // Create the element if it doesn't exist
        let toggleButton = new ToggleButton(enabledElementId, buildingRootElement, 2);
        if (state.visible) {
            console.log('rendering button');
            toggleButton.createOrUpdate({ styleClass: "auto-start", textContent: { on: "Start: Auto", off: "Start: Manual" }, isToggled: state.enabled, onToggle: callbacks.onEnableButtonToggle });
        } else {
            console.log('destroying button');
            toggleButton.destroy();
        }
    }
}
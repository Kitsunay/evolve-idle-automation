import { ToggleButton } from "../../interface/components/toggle-button/toggle-button";
import { Interface } from "../../interface/interface";

export class AutoStorageInterface {
    public static refreshEnableButton(storageId: string, enabled: boolean, onToggle: () => void) {
        // Get header with storage buy button
        let buttonContainerElement = document.querySelector<HTMLElement>(`#resStorage #createHead div.${storageId}`);

        // Check if the buy button is visible
        let isHidden = buttonContainerElement.querySelector('button').style.display === 'none';

        if (isHidden) {
            return;
        }

        let autoId = `auto-storage-${storageId}`;

        // Check if auto button exists
        let toggleButton = new ToggleButton(`${autoId}`, buttonContainerElement, 0);
        toggleButton.createOrUpdate({textContent: {on: "Auto: ON", off: "Auto: OFF"}, isToggled: enabled, onToggle: onToggle});
    }
}
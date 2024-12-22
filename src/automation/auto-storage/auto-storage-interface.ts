import { Interface } from "../../interface/interface";

export class AutoStorageInterface {
    public static refreshEnableButton(storageId: string, enabled: boolean, onClick: () => void) {
        // Get header with storage buy button
        let buttonContainerElement = document.querySelector<HTMLElement>(`#resStorage #createHead div.${storageId}`);

        // Check if the buy button is visible
        let isHidden = buttonContainerElement.querySelector('button').style.display === 'none';

        if (isHidden) {
            return;
        }

        let autoId = `auto-storage-${storageId}`;

        // Check if auto button exists
        let autoButtonElement = buttonContainerElement.querySelector<Element>(`#${autoId}`);

        if (!autoButtonElement) {
            // Add an "Auto" button above the buy button
            let elementString = `<div id="${autoId}" class="auto auto-storage"><span></span></div>`;
            autoButtonElement = Interface.createChildElementFromString(elementString, buttonContainerElement, 0);
            autoButtonElement.addEventListener('click', onClick);
        }

        // Update button values to represent the current "enabled" state
        let buttonText = `Auto: ${enabled ? 'On' : 'Off'}`;
        autoButtonElement.firstChild.textContent = buttonText;

        if (autoButtonElement.classList.contains('on') !== enabled) {
            autoButtonElement.classList.toggle('on');
        }
    }
}
import { ToggleButton } from "../../interface/components/toggle-button/toggle-button";
import { Interface } from "../../interface/interface";

export class AutoResearchInterface {
    /**
     * Render the button that enables/disables auto-research automation.
     */
    static refreshEnableButton(enabled: boolean, onToggle: () => void) {
        //let autoResearchElement: Element = document.querySelector<HTMLElement>(`#tech .auto-research`);
        let researchRootElement = document.querySelector<HTMLElement>(`#tech`);

        if (!researchRootElement) {
            return;
        }
        
        // Create the element if it doesn't exist exists
        let toggleButton = ToggleButton.getOrCreate(`auto_research_toggle_enabled`, researchRootElement, { styleClass: "auto-research", textContent: {on: "Auto: ON", off: "Auto: OFF"}, position: 0});
        toggleButton.onToggle = onToggle;
        toggleButton.isToggled = enabled;

        // Also make sure 'Automation' label is rendered
        if (!document.querySelector<HTMLElement>(`#auto-research-label`)) {
            let autoResearchLabelElementString = `<div id="auto-research-label"><h3 class="name has-text-warning">Automation</h3></div>`;
            Interface.createChildElementFromString(autoResearchLabelElementString, researchRootElement, 0);
        }
    }

    /**
     * Add an icon indicating that the research is automated.
     * @param knownResearches
     */
    static refreshAutomatedResearches(knownResearches: Set<string>) {
        let researchElements = document.querySelectorAll<HTMLElement>('#tech [id^="tech-"]');

        for (let index = 0; index < researchElements.length; index++) {
            const researchElement = researchElements[index];

            if (knownResearches.has(researchElement.id)) {
                // Make sure the automation icon is displayed
                let iconElement = researchElement.querySelector('.auto-research-icon');

                if (!iconElement) {
                    let iconElementString = `<div class="auto-research-icon top-right"><div class="icon icon-cogs icon-size-16 icon-color-white"></div></div>`;
                    iconElement = Interface.createChildElementFromString(iconElementString, researchElement);
                }
            }
        }
    }
}
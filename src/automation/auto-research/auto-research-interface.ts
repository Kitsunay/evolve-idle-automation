import { Interface } from "../../interface/interface";

export class AutoResearchInterface {
    /**
     * Map to keep track of existing listeners on research buttons, to prevent accidentally setting more than one listener.
     */
    private static onResearchBuyListeners = new Map<string, () => void>();

    /**
     * Render the button that enables/disables auto-research automation.
     */
    static refreshEnableButton(enabled: boolean, onClick: () => void) {
        let autoResearchElement: Element = document.querySelector<HTMLElement>(`#tech .auto-research`);
        let researchRootElement = document.querySelector<HTMLElement>(`#tech`);
        
        // Create the element if it doesn't exist exists
        if (!autoResearchElement && researchRootElement) {
            let autoBuildingElementString = `<div class="auto auto-research"><span>Auto-Research</span></div>`;
            autoResearchElement = Interface.createChildElementFromString(autoBuildingElementString, researchRootElement, 0);
            autoResearchElement.addEventListener('click', onClick);
        }

        // Also make sure 'Automation' label is rendered
        if (!document.querySelector<HTMLElement>(`#auto-research-label`)) {
            let autoResearchLabelElementString = `<div id="auto-research-label"><h3 class="name has-text-warning">Automation</h3></div>`;
            Interface.createChildElementFromString(autoResearchLabelElementString, researchRootElement, 0);
        }

        // Update element's value (on/off)
        if (autoResearchElement.classList.contains('on') !== enabled) {
            autoResearchElement.classList.toggle('on');
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

    static setOnResearchBuyListeners(callback: (researchId: string) => void) {
        Interface.ResearchInterface.addOnResearchBuyListener(callback);
    }

    static setOnResearchTabRefreshListener(callback: () => void) {
        Interface.ResearchInterface.addOnResearchRefreshListener(callback);
    }
}
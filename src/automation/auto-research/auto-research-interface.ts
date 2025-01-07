import { IconColor } from "../../interface/components/icons/icon-color";
import { SelectList } from "../../interface/components/select-list/select-list";
import { ToggleButton } from "../../interface/components/toggle-button/toggle-button";
import { Interface } from "../../interface/interface";
import { AutoResearchState } from "./auto-research-state";
import { ResearchChoiceList } from "./research-choice";

export class AutoResearchInterface {
    static update(state: AutoResearchState, callbacks: { onEnableToggle: () => void, onChoiceToggle: (researchId: string, choice: ResearchChoiceList) => void }) {
        this.refreshEnableButton(state.enabled, callbacks.onEnableToggle);

        this.refreshChoices(state.researchChoices, callbacks.onChoiceToggle);

        // Add an icon to researches that will be purchased automatically
        this.refreshAutomatedResearches(state.knownResearches);

        // Do that also for researches that were selected from a selection
        let selectedChoiceResearches = state.researchChoices.filter(x => x.selectedResearchIndex !== undefined).map(x => x.researches[x.selectedResearchIndex].id);
        this.refreshAutomatedResearches(selectedChoiceResearches, IconColor.PINK);

        this.clearNonAutomatedResearches([...Array.from(state.knownResearches), ...selectedChoiceResearches]);
    }

    /**
     * Render the button that enables/disables auto-research automation.
     */
    static refreshEnableButton(enabled: boolean, onToggle: () => void) {
        //let autoResearchElement: Element = document.querySelector<HTMLElement>(`#tech .auto-research`);
        let researchRootElement = document.querySelector<HTMLElement>(`#tech`);

        if (!researchRootElement) {
            return;
        }

        // Create the element if it doesn't exist
        let toggleButton = new ToggleButton(`auto_research_toggle_enabled`, researchRootElement, 0);
        toggleButton.createOrUpdate({ styleClass: "auto-research", textContent: { on: "Auto: ON", off: "Auto: OFF" }, isToggled: enabled, onToggle: onToggle });

        // Also make sure 'Automation' label is rendered
        if (!document.querySelector<HTMLElement>(`#auto-research-label`)) {
            let autoResearchLabelElementString = `<div id="auto-research-label"><h3 class="name has-text-warning">Automation</h3></div>`;
            Interface.createChildElementFromString(autoResearchLabelElementString, researchRootElement, 0);
        }
    }

    static refreshChoices(researchChoices: ResearchChoiceList[], onChoiceToggle: (researchId: string, choice: ResearchChoiceList) => void) {
        let parentElement = document.querySelector<HTMLElement>(`#tech`);

        for (let index = 0; index < researchChoices.length; index++) {
            let choice = researchChoices[index];
            const selectListId = `auto_research_choice_${choice.id}`;
            let selectList = new SelectList(selectListId, parentElement, index + 2); // Move after the 'Enable' button

            selectList.createOrUpdate({
                choices: choice.researches.map(x => ({
                    value: x.id,
                    label: x.isDiscovered ? (x.name ?? '???') : 'Undiscovered',
                    styleClass: !x.isDiscovered ? 'inactive' : undefined,
                    onToggle: () => { onChoiceToggle(x.id, choice); }
                })),
                selectedIndex: choice.selectedResearchIndex,
                styleClass: "auto-research-choice"
            });
        }
    }

    /**
     * Add an icon indicating that the research is automated.
     * @param knownResearches
     */
    static refreshAutomatedResearches(knownResearches: Set<string> | Iterable<string>, iconColorClass?: IconColor) {
        let researchElements = document.querySelectorAll<HTMLElement>('#tech [id^="tech-"]');

        for (let index = 0; index < researchElements.length; index++) {
            const researchElement = researchElements[index];

            let isVisible: boolean = false;
            if (knownResearches instanceof Set) {
                isVisible = knownResearches.has(researchElement.id);
            } else {
                for (const research of knownResearches) {
                    if (research === researchElement.id) {
                        isVisible = true;
                        break;
                    }
                }
            }

            if (isVisible) {
                // Make sure the automation icon is displayed
                let iconElement = researchElement.querySelector('.auto-research-icon');

                if (!iconElement) {
                    let iconElementString = `<div class="auto-research-icon top-right"><div class="icon icon-cogs icon-size-16 ${iconColorClass ? "icon-color-" + iconColorClass : "icon-color-white"}"></div></div>`;
                    iconElement = Interface.createChildElementFromString(iconElementString, researchElement);
                }
            }
        }
    }

    static clearNonAutomatedResearches(knownResearches: string[]) {
        let researchElements = document.querySelectorAll<HTMLElement>('#tech [id^="tech-"]');

        for (let index = 0; index < researchElements.length; index++) {
            const researchElement = researchElements[index];

            if (!knownResearches.includes(researchElement.id)) {
                // Make sure the automation icon is not displayed
                let iconElement = researchElement.querySelector('.auto-research-icon');

                if (iconElement) {
                    iconElement.remove();
                }
            }
        }
    }
}
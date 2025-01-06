import { Game } from "../../game/game";
import { CogsIcon } from "../../interface/components/icons/cogs-icon/cogs-icon";
import { NumberInputComponent } from "../../interface/components/number-input/number-input";
import { ToggleButton } from "../../interface/components/toggle-button/toggle-button";
import { Interface } from "../../interface/interface";
import { AutoEvolutionState } from "./auto-evolution-state";

export class AutoEvolutionInterface {
    public static update(
        state: AutoEvolutionState,
        callbacks: {
            onPauseToggle: () => void,
            onSub: (buildingId: string) => void,
            onAdd: (buildingId: string) => void
        }) {

        this.refreshPauseButton(state.enabled, callbacks.onPauseToggle);
        this.refreshBuildingTargetConfigs(state, callbacks.onSub, callbacks.onAdd);
    }

    private static refreshPauseButton(paused: boolean, onToggle: () => void) {
        let evolutionRootElement = document.querySelector<HTMLElement>(`#evolution`);

        if (!evolutionRootElement) {
            return;
        }

        let pauseElementId = `auto_building_toggle_pause`;

        // Create the element if it doesn't exist
        let toggleButton = ToggleButton.getOrCreate(pauseElementId, evolutionRootElement, { styleClass: "pause-button", textContent: { on: "Paused", off: "Pause" }, position: 0 });
        toggleButton.onToggle = onToggle;
        toggleButton.isToggled = paused;

        // Also make sure 'Automation' label is rendered
        if (!document.querySelector<HTMLElement>(`#auto-evolution-label`)) {
            let autoEvolutionLabelElementString = `<div id="auto-evolution-label"><h3 class="name has-text-warning">Automation</h3></div>`;
            Interface.createChildElementFromString(autoEvolutionLabelElementString, evolutionRootElement, 0);
        }
    }

    private static refreshBuildingTargetConfigs(state: AutoEvolutionState, onSub: (buildingId: string) => void, onAdd: (buildingId: string) => void) {
        let buildingConfigs = [
            { id: 'evolution-organelles', targetLevel: state.targetOrganelles, onSub: () => onSub('evolution-organelles'), onAdd: () => onAdd('evolution-organelles') },
            { id: 'evolution-nucleus', targetLevel: state.targetNucleus, onSub: () => onSub('evolution-nucleus'), onAdd: () => onAdd('evolution-nucleus') },
            { id: 'evolution-membrane', targetLevel: state.targetMembrane, onSub: () => onSub('evolution-membrane'), onAdd: () => onAdd('evolution-membrane') },
            { id: 'evolution-eukaryotic_cell', targetLevel: state.targetEukaryoticCell, onSub: () => onSub('evolution-eukaryotic_cell'), onAdd: () => onAdd('evolution-eukaryotic_cell') },
            { id: 'evolution-mitochondria', targetLevel: state.targetMitochondria, onSub: () => onSub('evolution-mitochondria'), onAdd: () => onAdd('evolution-mitochondria') },
        ];

        for (const buildingConfig of buildingConfigs) {
            this.refreshBuildingTargetConfig(buildingConfig);
        }
    }

    static refreshBuildingTargetConfig(buildingConfig: { id: string; targetLevel: number; onSub: () => void; onAdd: () => void; }) {
        let building = Game.Evolution.getBuilding(buildingConfig.id);

        if (!building || !building.isVisible) {
            return;
        }

        // Add a component that allows the player to change the target level of the building
        let targetLevelElementId = `auto_evolution_target_level_${buildingConfig.id}`;

        // Make sure the component doesn't exist yet
        let wrapperElement: Element = document.getElementById(targetLevelElementId);
        if (!wrapperElement) {
            // Create the component, start with wrapper and label
            let wrapperString = `<div id="${targetLevelElementId}" class="target-level-wrapper"></div>`;
            wrapperElement = Interface.createChildElementFromString(wrapperString, building.mainElement, 0);
        }

        // Create the inside of the wrapper: automation icon, label and number input
        let cogsIcon = new CogsIcon(`auto_evolution_target_level_${buildingConfig.id}`, wrapperElement);
        cogsIcon.createOrUpdate({ size: 14, color: "white" });

        let labelId = `label_auto_evolution_target_level_${buildingConfig.id}`;
        let labelElement = document.getElementById(`#${labelId}`);
        if (!labelElement) {
            Interface.getOrCreate({ elementId: labelId, parentElement: wrapperElement, elementString: `<div id="${labelId}" class="target-level-label">Max:</div>` });
        }

        let numberInput = new NumberInputComponent(`auto_evolution_target_level_${buildingConfig.id}`, wrapperElement);
        numberInput.createOrUpdate({ content: buildingConfig.targetLevel, onSub: buildingConfig.onSub, onAdd: buildingConfig.onAdd });
    }
}
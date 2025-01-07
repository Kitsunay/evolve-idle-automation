import { ToggleButton } from "../../interface/components/toggle-button/toggle-button";
import { AutoMilitaryState } from "./auto-military-state";

export class AutoMilitaryInterface {
    public static update(config: { state: AutoMilitaryState, onEnabledToggle: () => void, onAutoBattleToggle: (enabled: boolean, foreignPowerId: string) => void }) {
        // Add a toggle button above each "Attack" botton
        let foreignPowerElements = Array.from(document.querySelectorAll('#foreign .foreign'));

        for (const foreignPowerElement of foreignPowerElements) {
            let foreignPowerId = foreignPowerElement.getAttribute('id');

            let autoAttackButtonId = `auto-attack-${foreignPowerId}`;

            let autoAttackButton = new ToggleButton(autoAttackButtonId, foreignPowerElement, 1);
            autoAttackButton.createOrUpdate({
                styleClass: "auto-attack-button",
                textContent: {
                    on: "Auto: ON",
                    off: "Auto: OFF"
                },
                isToggled: config.state.autoBattle.targetId === foreignPowerId && config.state.autoBattle.enabled,
                onToggle: () => { config.onAutoBattleToggle(autoAttackButton.isToggled, foreignPowerId); }
            });
        }
    }
}
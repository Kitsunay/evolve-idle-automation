import { Game } from "../../game/game";
import { Automation } from "../automation";
import { AutoMilitaryInterface } from "./auto-military-interface";
import { AutoMilitaryState } from "./auto-military-state";

export class AutoMilitary extends Automation<AutoMilitaryState> {
    protected LOCAL_STORAGE_KEY: string = "auto-military"
    protected state: AutoMilitaryState = { unlocked: false, enabled: false, autoBattle: { unlocked: false, enabled: false, targetId: undefined } }

    tick(): void {
        if (!this.state.autoBattle.enabled) {
            return
        }

        let maxSoldiers = Game.Military.maxSoldiers;
        let currSoldiers = Game.Military.soldiers;
        let woundedSoldiers = Game.Military.woundedSoldiers;

        // Launch an attack only if there are soldiers, there are no wounded soldiers and soldier cap has been reached
        if (currSoldiers > 0 && woundedSoldiers === 0 && currSoldiers >= maxSoldiers) {
            Game.Military.attack(this.state.autoBattle.targetId);
        }
    }

    updateUI(): void {
        AutoMilitaryInterface.update({
            state: this.state,
            onEnabledToggle: () => { /*nohting*/ },
            onAutoBattleToggle: (enabled: boolean, foreignPowerId: string) => {
                this.toggleAutoBattle(enabled, foreignPowerId);
            }
        });
    }

    toggleAutoBattle(enabled: boolean, foreignPowerId: string) {
        console.log(foreignPowerId, this.state.autoBattle);
        if (this.state.autoBattle.targetId === foreignPowerId) {
            this.state.autoBattle.enabled = !this.state.autoBattle.enabled;
        } else {
            this.state.autoBattle.targetId = foreignPowerId;
            this.state.autoBattle.enabled = true;
        }

        this.updateUI();
    }
}
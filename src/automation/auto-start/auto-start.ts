import { Game } from "../../game/game";
import { Automation } from "../automation";
import { AutoStartInterface } from "./auto-start-interface";
import { AutoStartState } from "./auto-start-state";

export class AutoStart extends Automation<AutoStartState> {
    protected LOCAL_STORAGE_KEY: string = "auto-start";
    protected state: AutoStartState = {
        enabled: false,
        unlocked: false,
        visible: false
    };

    private tickCounter: number = 0;

    tick(): void {
        let oldVisible = this.state.visible;

        if (Game.Buildings.getBuilding('city-university').level > 0) { // Stop the automation after university is purchased, at this point it is not needed anymore
            this.state.visible = false;

            if (oldVisible !== this.state.visible) { // On change, update the UI
                this.updateUI();
            }

            return;
        } else {
            this.state.visible = true;

            if (oldVisible !== this.state.visible) { // On change, update the UI
                this.updateUI();
            }
        }

        if (!this.state.enabled) {
            return;
        }

        // Try to cycle through all gatherable resources, collecting once per tick
        let gatherables = Game.Resources.gatherableResources;

        if (this.tickCounter < gatherables.length) {
            Game.Resources.tryGather(gatherables[this.tickCounter]);
        }

        this.tickCounter = (this.tickCounter + 1) % gatherables.length;
    }

    updateUI(): void {
        AutoStartInterface.update(
            this.state,
            {
                onEnableButtonToggle: this.decorateInterfaceListener(() => {
                    this.state.enabled = !this.state.enabled;
                })
            }
        )
    }
}
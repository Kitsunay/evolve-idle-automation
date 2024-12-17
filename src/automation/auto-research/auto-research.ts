import { AutomationEngine } from "../../automation-engine";
import { Game } from "../../game/game";
import { AutoResearchInterface } from "../../interface/auto-research/auto-research-interface";
import { Automation } from "../automation";
import { AutoResearchState } from "./auto-research-state";

export class AutoResearch extends Automation<AutoResearchState> {
    protected readonly LOCAL_STORAGE_KEY: string = "auto-research";

    protected state: AutoResearchState = {
        unlocked: false,
        enabled: false,
        knownResearches: new Set<string>()
    }

    init(): void {
        this.loadState();
        this.updateUI();
    }

    updateUI() {
        // Button to turn this automation on/off
        AutoResearchInterface.refreshEnableButton(this.state.enabled, () => {
            this.state.enabled = !this.state.enabled;
            this.saveState();
            this.updateUI();
        });

        AutoResearchInterface.setOnResearchBuyListeners((researchId: string) => {
            // On purchase, add the research to automated research set
            if (!this.state.knownResearches.has(researchId)) {
                this.state.knownResearches.add(researchId);

                this.saveState();

                console.log(`Added research to auto-research list [${researchId}]`);
            }
        });

        AutoResearchInterface.refreshAutomatedResearches(this.state.knownResearches);
    }

    tick(): void {
        if (!this.state.enabled) {
            return;
        }

        // Get purchasable researches
        let purchasableResearches = Game.Research.getPurchasableResearches();

        // Find first purchasable research that is known and purchase it
        for (const research of purchasableResearches) {
            if (this.state.knownResearches.has(research.researchId)) {
                Game.Research.tryBuyResearch(research);

                // This purchase causes full UI re-render, so all automations need to be updated to prevent flickering
                AutomationEngine.updateAllUI(); // ALWAYS UPDATE UI AFTER PURCHASE !!!

                console.log(`Purchased research [${research.researchId}]`);

                return; // Only one purchase per tick, to allow the game to update
            }
        }
    }
}
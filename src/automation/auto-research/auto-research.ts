import { AutomationEngine } from "../../automation-engine";
import { Game } from "../../game/game";
import { AutoResearchInterface } from "./auto-research-interface";
import { Automation } from "../automation";
import { AutoResearchState } from "./auto-research-state";

export class AutoResearch extends Automation<AutoResearchState> {
    protected readonly LOCAL_STORAGE_KEY: string = "auto-research";

    protected state: AutoResearchState = {
        unlocked: false,
        enabled: false,
        knownResearches: new Set<string>()
    }

    private exceptions: string[] = ['civ-anthropology', 'civ-fanaticism']; // These researches cannot be automated

    updateUI() {
        // Button to turn this automation on/off
        AutoResearchInterface.refreshEnableButton(this.state.enabled, () => {
            this.state.enabled = !this.state.enabled;
            this.saveState();
            this.updateUI();
        });

        AutoResearchInterface.setOnResearchBuyListeners((researchId: string) => {
            // On purchase, add the research to automated research set
            if (!this.state.knownResearches.has(researchId) && !this.exceptions.includes(researchId)) {
                this.state.knownResearches.add(researchId);

                this.saveState();
                
                console.log(`Added research [${researchId}] to auto-research list`);
            }

            AutomationEngine.updateAllUI(); // ALWAYS UPDATE UI AFTER RESEARCH PURCHASE !!!
        });

        AutoResearchInterface.refreshAutomatedResearches(this.state.knownResearches);

        // Refresh auto-research UI on actions that cause full UI re-render
        AutoResearchInterface.setOnResearchTabRefreshListener(() => {
            this.updateUI();
        })
    }

    tick(): void {
        if (!this.state.enabled) {
            return;
        }

        // Don't buy if player queued up a research
        if (Game.Research.ResearchQueue.exists && Game.Research.ResearchQueue.queueItems().length > 0) {
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

                console.log(`Automation purchased research [${research.researchId}]`);

                return; // Only one purchase per tick, to allow the game to update
            }
        }
    }
}
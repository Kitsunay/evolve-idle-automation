import { AutomationEngine } from "../../automation-engine";
import { Game } from "../../game/game";
import { AutoResearchInterface } from "./auto-research-interface";
import { Automation } from "../automation";
import { AutoResearchState } from "./auto-research-state";
import { ResearchChoiceList } from "./research-choice";
import { AfterLoadState } from "../interfaces/after-load-state";

export class AutoResearch extends Automation<AutoResearchState> implements AfterLoadState {
    protected readonly LOCAL_STORAGE_KEY: string = "auto-research";

    protected state: AutoResearchState = {
        unlocked: false,
        enabled: false,
        knownResearches: new Set<string>(),
        researchChoices: [],
    }

    private researchChoicePrototypes: ResearchChoiceList[] = [ // These researches cannot be automated in a simple way
        {
            id: 'transcendence',
            researches: [
                { id: 'tech-anthropology', name: undefined, isDiscovered: false },
                { id: 'tech-fanaticism', name: undefined, isDiscovered: false },
            ],
            selectedResearchIndex: undefined,
        },
        {
            id: 'preeminence',
            researches: [
                { id: 'tech-study', name: undefined, isDiscovered: false },
                { id: 'tech-deify', name: undefined, isDiscovered: false },
            ],
            selectedResearchIndex: undefined,
        }
    ];

    private researchChoiceIgnoreConditions: Map<string, () => boolean> = new Map<string, () => boolean>([
        ['transcendence', () => Game.Perks.hasPerk('transcendence')]
    ]);

    updateUI() {
        AutoResearchInterface.update(
            this.state,
            {
                onEnableToggle: this.decorateInterfaceListener(() => this.state.enabled = !this.state.enabled),
                onChoiceToggle: this.decorateInterfaceListener((researchId: string, choice: ResearchChoiceList) => this.setResearchChoice(researchId, choice))
            }
        );

        /*
        // Button to turn this automation on/off
        AutoResearchInterface.refreshEnableButton(this.state.enabled, () => {
            this.state.enabled = !this.state.enabled;
            this.saveState();
            this.updateUI();
        });
        */

        Game.Research.onResearchBuy.addListener((researchId: string) => {
            // On purchase, add the research to automated research set
            if (this.researchChoicePrototypes.flatMap(x => x.researches).map(x => x.id).includes(researchId)) {
                this.updateResearchChoice(researchId);
                this.saveState();
            } else if (!this.state.knownResearches.has(researchId)) {
                this.state.knownResearches.add(researchId);

                this.saveState();

                console.log(`Added research [${researchId}] to auto-research list`);
            }

            AutomationEngine.updateAllUI(); // ALWAYS UPDATE UI AFTER RESEARCH PURCHASE !!!
        });

        // AutoResearchInterface.refreshAutomatedResearches(this.state.knownResearches);

        // Refresh auto-research UI on actions that cause full UI re-render
        Game.Research.onResearchTabRefresh.addListener(() => {
            this.updateUI();
        })
    }

    private updateResearchChoice(id: string) {
        // Initialize if it doesn't exist
        if (!this.state.researchChoices) {
            this.state.researchChoices = [];
        }

        // Find choice state
        let choiceState = this.state.researchChoices.find(x => x.researches.find(y => y.id === id));

        if (!choiceState) {
            // Insert the choice into the state
            let choicePrototype = this.researchChoicePrototypes.find(x => x.researches.find(y => y.id === id));

            this.state.researchChoices.push(choicePrototype);
            choiceState = choicePrototype;
        }

        // Update technology name in choice state
        let research = choiceState.researches.find(x => x.id === id);
        research.name = Game.Research.completedResearches.find(x => x.id === id).name;
        research.isDiscovered = true;
    }

    private setResearchChoice(choiceId: string, choice: ResearchChoiceList) {
        // Check if choice has name (which means that it has been discovered)
        let choiceIndex = choice.researches.findIndex(x => x.id === choiceId);
        let choiceItem = choice.researches[choiceIndex];
        if (!choiceItem.name) {
            return;
        }

        // Check if choice is currently active
        if (choice.selectedResearchIndex === choiceIndex) {
            choice.selectedResearchIndex = undefined;
        } else {
            choice.selectedResearchIndex = choiceIndex;
        }
    }

    tick(): void {
        if (!this.state.enabled) {
            return;
        }

        // Don't buy if player queued up a research
        if (Game.Research.ResearchQueue.exists && Game.Research.ResearchQueue.queueItems.length > 0) {
            return;
        }

        // Get purchasable researches
        let purchasableResearches = Game.Research.purchasableResearches;

        // Find first purchasable research that is known and purchase it
        for (const research of purchasableResearches) {
            if (this.state.knownResearches.has(research.id)) {
                Game.Research.tryBuyResearch(research);

                // This purchase causes full UI re-render, so all automations need to be updated to prevent flickering
                AutomationEngine.updateAllUI(); // ALWAYS UPDATE UI AFTER PURCHASE !!!

                console.log(`Automation purchased research [${research.id}]`);

                return; // Only one purchase per tick, to allow the game to update
            }

            // Also check if the research is selected in a choice
            for (const choice of this.state.researchChoices) {
                if (choice.selectedResearchIndex !== undefined &&
                    choice.researches[choice.selectedResearchIndex].id === research.id) {
                    Game.Research.tryBuyResearch(research);

                    console.log(`Automation purchased research [${research.id}]`);

                    return; // Only one purchase per tick, to allow the game to update
                }
            }
        }
    }

    afterLoadState(): void {
        // Load choice researches unlock (or not, implemented this because i thought i will need it, i will keep it just in case i might actually need this)
    }
}
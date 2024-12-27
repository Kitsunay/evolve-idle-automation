import { Game } from "../../game/game";
import { AutoBuildingInterface } from "./auto-building-interface";
import { Automation } from "../automation";
import { AutoBuildingState } from "./auto-building-state";
import { AutoBuildingItem } from "./auto-building-item";
import { AutomationEngine } from "../../automation-engine";

export class AutoBuilding extends Automation<AutoBuildingState> {
    /**
     * Persistable configuration with default values and all buildings.
     * The core of this automation.
     */
    protected state: AutoBuildingState = {
        unlocked: false,
        paused: false,
        buildings: []
    }

    /**
     * Whether this automation is unlocked
     */
    get unlocked(): boolean {
        return this.state.unlocked;
    }

    /**
     * Key to store configuration and state in local storage
     */
    protected readonly LOCAL_STORAGE_KEY: string = "auto-building";

    /**
     * Default configuration for all buildings.
     */
    get buildings(): AutoBuildingItem[] {
        return this.state.buildings;
    }

    updateUI() {
        // Auto-Discovery: Before full UI update, check if there are any new jobs to automate
        // TODO: Trigger auto-discovery only after research/building purchase?
        this.runAutoDiscovery();

        for (const building of this.buildings) {
            AutoBuildingInterface.refreshBuildingInterface(building.buildingId, building.autoEnabled, this.state.paused, () => {
                this.toggle(building.buildingId);
            });
        }

        AutoBuildingInterface.refreshPauseButton(this.state.paused, () => {
            this.state.paused = !this.state.paused;
            this.saveState();
            this.updateUI();
        });
    }

    runAutoDiscovery() {
        let availableBuildings = Game.Buildings.getBuildings();

        // Add in buildings that are not present in the configuration array
        for (const building of availableBuildings) {
            if (!this.state.buildings.some(x => x.buildingId === building.buildingId)) { // If none of the buildingIds in configuration match the current building
                // Add a new configuration item
                this.state.buildings.push({
                    buildingId: building.buildingId,
                    autoEnabled: false,
                    unlocked: false
                });
            }
        }
    }

    /**
     * Toggles automation for the given building
     * @param buildingId
     */
    private toggle(buildingId: string) {
        for (const building of this.buildings) {
            if (building.buildingId === buildingId) {
                building.autoEnabled = !building.autoEnabled;
                break;
            }
        }

        this.saveState();
        this.updateUI();
    }

    /**
     * Automation logic to run every tick
     */
    public tick() {
        this.updateUI(); // Patchwork keeping the UI up to date

        if (this.state.paused) { // Don't do anything if automation is paused
            return;
        }

        if (Game.Buildings.BuildingQueue.exists && Game.Buildings.BuildingQueue.queueItems.length > 0) { // Don't do anything if there are items in the queue (prioritize player's queue)
            return;
        }

        let firstPurchase = false; // Watch for purchases where the first building of a type is purchased

        for (const buildingItem of this.buildings) {
            // Try to purchase buildings of all enabled autobuyers
            if (buildingItem.autoEnabled) {
                let building = Game.Buildings.getBuilding(buildingItem.buildingId);

                if (Game.Buildings.tryBuy(building)) { // At most one building per type per tick (TODO: currently adds unbuyable buildings to queue)
                    if (Game.Buildings.getBuilding(buildingItem.buildingId).count === 1) {
                        firstPurchase = true;
                    }

                    console.log(`Automation purchased building [${buildingItem.buildingId}]`);
                    break; // Limit to one purchase per tick to avoid the issue described above
                }
            }
        }

        // If first purchase happened, update UI, unlock might have happened and automations ahould react to it properly
        if (firstPurchase) {
            AutomationEngine.updateAllUI();
        }
    }
}
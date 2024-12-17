import { Game } from "../../game/game";
import { AutoBuildingInterface } from "../../interface/auto-building/auto-building-interface";
import { Automation } from "../automation";
import { AutoBuildingState } from "./auto-building-state";
import { AutoBuildingItem } from "./auto-building-item";

export class AutoBuilding extends Automation<AutoBuildingState> {
    /**
     * Persistable configuration with default values and all buildings.
     * The core of this automation.
     */
    protected state: AutoBuildingState = {
        unlocked: false,
        buildings: [
            // Commercial District
            {
                buildingId: "city-bank",
                autoEnabled: false
            },
            {
                buildingId: "city-amphitheatre",
                autoEnabled: false
            }, {
                buildingId: "city-temple",
                autoEnabled: false
            },

            // Science Sector
            {
                buildingId: "city-university",
                autoEnabled: false
            },
            {
                buildingId: "city-library",
                autoEnabled: false
            },

            // Trade District
            {
                buildingId: "city-silo",
                autoEnabled: false
            },
            {
                buildingId: "city-shed",
                autoEnabled: false
            },

            // Industrial Park
            {
                buildingId: "city-lumber_yard",
                autoEnabled: false
            },
            {
                buildingId: "city-rock_quarry",
                autoEnabled: false
            },
            {
                buildingId: "city-cement_plant",
                autoEnabled: false
            },
            {
                buildingId: "city-foundry",
                autoEnabled: false
            },
            {
                buildingId: "city-mine",
                autoEnabled: false
            },
        ]
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

    public init() {
        // Load configuration and state from local storage (from string to object)
        this.loadState();

        // Update UI
        this.updateUI();
    }

    updateUI() {
        for (const building of this.buildings) {
            AutoBuildingInterface.refreshBuildingInterface(building.buildingId, building.autoEnabled, () => {
                this.toggle(building.buildingId);
            });
        }
    }

    /**
     * Toggles automation for the given building
     * @param buildingId
     */
    private toggle(buildingId: string) {
        console.log('toggle');

        for (const building of this.buildings) {
            if (building.buildingId === buildingId) {
                building.autoEnabled = !building.autoEnabled;
                break;
            }
        }

        this.saveState();
        this.updateUI();
    }

    protected override loadState() {
        let configuration = this.loadStateObject();

        if (!configuration) { // No configuration in local storage
            return;
        }

        // Load configuration without overwriting known buildings
        this.state.unlocked = configuration.unlocked;

        if (!configuration.buildings) { // No buildings loaded from local storage
            return;
        }

        for (const buildingIndex in this.state.buildings) { // I broke array loading, turned arrays into objects and now i need a key iterating loop
            let building = this.state.buildings[buildingIndex];

            for (const loadedBuilding of configuration.buildings) {
                // Find persisted configuration for each building by matching buildingId
                if (building.buildingId === loadedBuilding.buildingId) {
                    building.autoEnabled = loadedBuilding.autoEnabled;
                    break;
                }
            }
        }
    }

    /**
     * Automation logic to run every tick
     */
    public tick() {
        this.updateUI();

        for (const buildingItem of this.buildings) {
            // Try to purchase buildings of all enabled autobuyers
            if (buildingItem.autoEnabled) {
                let building = Game.Buildings.getBuilding(buildingItem.buildingId);

                if (Game.Buildings.tryBuy(building)) { // At most one building per type per tick
                    console.log(`Purchased building [${buildingItem.buildingId}]`);
                }
            }
        }
    }
}
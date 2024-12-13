import { Game } from "../../game/game";
import { AutoBuildingInterface } from "../../interface/auto-building/auto-building-interface";
import { AutoBuildingConfiguration } from "./auto-building-configuration";
import { AutoBuildingItem } from "./auto-building-item";

export class AutoBuilding {
    /**
     * Persistable configuration with default values and all buildings.
     * The core of this automation.
     */
    private static configuration: AutoBuildingConfiguration = {
        unlocked: false,
        buildings:  [
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
    static get unlocked(): boolean {
        return this.configuration.unlocked;
    }

    /**
     * Key to store configuration and state in local storage
     */
    private static readonly LOCAL_STORAGE_KEY: string = "auto-building";

    /**
     * Default configuration for all buildings.
     */
    static get buildings(): AutoBuildingItem[] {
        return this.configuration.buildings;
    }

    public static init() {
        // Load configuration and state from local storage (from string to object)
        this.loadConfiguration();

        // Update UI
        AutoBuilding.updateUI();
    }

    private static updateUI() {
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
    private static toggle(buildingId: string) {
        for (const building of this.buildings) {
            if (building.buildingId === buildingId) {
                building.autoEnabled = !building.autoEnabled;
            }
        }

        this.saveConfiguration();
        this.updateUI();
    }

    static saveConfiguration() {
        localStorage.setItem(AutoBuilding.LOCAL_STORAGE_KEY, JSON.stringify(this.configuration));
    }

    static loadConfiguration() {
        let configuration = JSON.parse(localStorage.getItem(AutoBuilding.LOCAL_STORAGE_KEY));

        if (!configuration) { // No configuration in local storage
            return;
        }

        // Load configuration without overwriting known buildings
        this.configuration.unlocked = configuration.unlocked;

        for (const building of this.configuration.buildings) {
            for (const loadedBuilding of configuration.buildings) {
                // Find persisted configuration for each building by matching buildingId
                if (building.buildingId === loadedBuilding.buildingId) {
                    building.autoEnabled = loadedBuilding.autoEnabled;
                }
            }
        }
    }

    /**
     * Automation logic to run every tick
     */
    public static tick() {
        this.updateUI();

        //console.log('tick');
        for (const building of this.buildings) {
            //console.log(building);
            // Try to purchase buildings of all enabled autobuyers
            if (building.autoEnabled) {
                Game.buildings.getBuilding(building.buildingId).tryBuy();
            }
        }
    }
}
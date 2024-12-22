import { Game } from "../../game/game";
import { Automation } from "../automation";
import { AutoStorageInterface } from "./auto-storage-interface";
import { AutoStorageItem } from "./auto-storage-item";
import { AutoStorageState } from "./auto-storage-state";

export class AutoStorage extends Automation<AutoStorageState> {
    protected LOCAL_STORAGE_KEY: string = "auto-storage";
    protected state: AutoStorageState = {
        unlocked: false,
        items: []
    };

    tick(): void {
        for (const autoStorageConfig of this.state.items) {
            if (!autoStorageConfig.enabled) { // Do not alter storage items that are not enabled
                continue;
            }

            let storageItem = Game.Storage.getStorageItem(autoStorageConfig.storageId);

            if (!storageItem.visible) { // Do not try to alter storage items that are not available
                continue;
            }

            // Try to buy the storage item
            if (Game.Storage.tryBuyStorageItem(storageItem)) {
                return; // Only one action per tick (doesn't seem to be working properly)
            }

            // Collect an array of resources and amount of storage items that they have assigned
            let assignments = storageItem.assignments;
            let numStorageItems = storageItem.count;
            let numFreeStorageItems = storageItem.freeCount;

            // Calculate target for each resource
            let target = Math.floor(numStorageItems / assignments.length); // Simplest equal distribution of storage space

            // Move towards the target
            for (const assignment of assignments) {
                let current = assignment.count;

                if (current < target && numFreeStorageItems > 0) { // If storage item was purchased
                    Game.Storage.addStorageItem(assignment);
                    return; // Only one assignment per tick to achieve sub-optimal results
                }

                if (current > target) { // If new resource was unlocked
                    Game.Storage.removeStorageItem(assignment);
                    return; // Only one assignment per tick to achieve sub-optimal results
                }
            }
        }
    }

    updateUI(): void {
        this.runAutoDiscovery();

        // Update UI
        for (const storageItem of this.state.items) {
            AutoStorageInterface.refreshEnableButton(storageItem.storageId, storageItem.enabled, () => {
                this.toggleStorageItem(storageItem);
            });
        }
    }

    toggleStorageItem(storageItem: AutoStorageItem) {
        storageItem.enabled = !storageItem.enabled;
        this.saveState();
        this.updateUI();
    }

    runAutoDiscovery() {
        let storageItems = Game.Storage.storageItems;

        // Add in storage items that are not present in the configuration array
        for (const storageItem of storageItems) {
            if (!this.state.items.some(x => x.storageId === storageItem.name)) { // If none of the storageIds in configuration match the current storage item
                // Add a new configuration item
                this.state.items.push({
                    storageId: storageItem.name,
                    enabled: false
                });
            }
        }
    }
}
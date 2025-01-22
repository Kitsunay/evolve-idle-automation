import { BuildingItem } from "../../game/buildings/building-item";
import { Game } from "../../game/game";
import { Automation } from "../automation";
import { AutoEnergyInterface } from "./auto-energy-interface";
import { AutoEnergyState } from "./auto-energy-state";
import { EnergyConsumer } from "./energy-consumer";

export class AutoEnergy extends Automation<AutoEnergyState> {
    protected LOCAL_STORAGE_KEY: string = "auto-energy";
    protected state: AutoEnergyState = { unlocked: false, enabled: false, energyConsumers: [] };
    private prevTickDistributedEnergy: boolean = false;

    tick(): void {
        if (this.prevTickDistributedEnergy) { // UI updates required the game's UI to update, and it's not available immediately after 'this.tryDistributeEnergy()' completes
            this.updateUI();
        }

        this.prevTickDistributedEnergy = this.tryDistributeEnergy();
    }

    updateUI(): void {
        this.autoDiscovery();

        AutoEnergyInterface.update(
            this.state,
            () => {
                this.state.enabled = !this.state.enabled;
                this.saveState();
                this.updateUI();
            },
            (buildingIds, newGroupBetween, newPriority) => {
                this.onDrop(buildingIds, newGroupBetween, newPriority);
            }
        );
    }

    /**
     * Checks the game's interface for new electrified buildings
     */
    private autoDiscovery() {
        let electrifiedBuildings = Game.PowerGrid.buildings;

        // Update state of known buildings to unlocked/locked based on whether they are visible or not in the game
        // At the same time, keep track of which buildings were not queried yet to find new ones
        for (const energyConsumer of this.state.energyConsumers) {
            let electrifiedBuildingIndex = electrifiedBuildings.findIndex(x => x.buildingId === energyConsumer.id);

            if (electrifiedBuildingIndex !== -1) {
                energyConsumer.unlocked = true;
                electrifiedBuildings.splice(electrifiedBuildingIndex, 1);
            } else {
                energyConsumer.unlocked = false;
            }
        }

        // Check if there are any new electrified buildings to add to the list of known buildings
        for (const electrifiedBuilding of electrifiedBuildings) {
            this.state.energyConsumers.push({ id: electrifiedBuilding.buildingId, priority: undefined, unlocked: true });
        }
    }

    private onDrop(buildingIds: string[], newGroupBetween: { min: number | undefined, max: number | undefined }, newPriority: number) {
        // If newGroupBetween is not set, assign newPriority directly to all buildings in the group being moved
        if (newGroupBetween === undefined) {
            let originalPriority: number;

            for (const buildingId of buildingIds) {
                let energyConsumer = this.state.energyConsumers.find(x => x.id === buildingId);
                if (energyConsumer) {
                    originalPriority = energyConsumer.priority;
                    energyConsumer.priority = newPriority;
                }
            }

            // If no buildings from the original priority exist, move from the original priority down by 1
            if (this.state.energyConsumers.filter(x => x.priority === originalPriority).length === 0) {
                this.moveDown(originalPriority);
            }

            this.saveState();
            this.updateUI();
            return;
        }

        // Otherwise detect if group requires other buildings to move before changing priorities
        // If min is undefined, it's a new group above the max unlimited priority
        if (newGroupBetween.min === undefined) {
            let maxPriority = Math.max(...this.state.energyConsumers.map(x => x.priority || 0));
            this.move(undefined, maxPriority + 1); // Move original undefined to just above max priority as new group

            let originalPriority: number;

            // Move all dropped buildings to undefined priority
            for (const buildingId of buildingIds) {
                let energyConsumer = this.state.energyConsumers.find(x => x.id === buildingId);

                if (energyConsumer) {
                    originalPriority = energyConsumer.priority;
                    energyConsumer.priority = undefined;
                }
            }

            this.moveDown(originalPriority); // Move down all buildings that were above the group that moved to undefined

            this.saveState();
            this.updateUI();
            return;
        }

        // If min is not a number, it's going to be the first group, start at priority 1 and move everithing up by 1
        if (Number.isNaN(newGroupBetween.min)) {
            this.moveUp(1);

            let originalPriority: number;

            // Move all dropped buildings to priority 1
            for (const buildingId of buildingIds) {
                let energyConsumer = this.state.energyConsumers.find(x => x.id === buildingId);

                if (energyConsumer) {
                    originalPriority = energyConsumer.priority;
                    energyConsumer.priority = 1;
                }
            }

            this.moveDown(originalPriority); // Move down all buildings that were above the group that moved to 1

            this.saveState();
            this.updateUI();
            return;
        }

        // If min is a number, insert the group above min and move everithing up by 1
        this.moveUp(newGroupBetween.min + 1);

        let originalPriority: number;

        // Move all dropped buildings to priority after min
        for (const buildingId of buildingIds) {
            let energyConsumer = this.state.energyConsumers.find(x => x.id === buildingId);

            if (energyConsumer) {
                originalPriority = energyConsumer.priority;
                energyConsumer.priority = newGroupBetween.min + 1;
            }
        }

        // If no buildings from the original priority exist, move from the original priority down by 1
        if (this.state.energyConsumers.filter(x => x.priority === originalPriority).length === 0) {
            this.moveDown(originalPriority);
        }

        this.saveState();
        this.updateUI();
        return;
    }

    /**
     * Moves all buildings with priority equal or higher than minPriority up by 1
     * @param minPriority
     */
    private moveUp(minPriority: number) {
        for (const energyConsumer of this.state.energyConsumers) {
            if (energyConsumer.priority >= minPriority) {
                energyConsumer.priority = energyConsumer.priority + 1;
            }
        }
    }

    /**
     * Moves all buildings with priority equal or higher than minPriority down by 1
     * @param minPriority 
     */
    private moveDown(minPriority: number) {
        for (const energyConsumer of this.state.energyConsumers) {
            if (energyConsumer.priority >= minPriority) {
                energyConsumer.priority = energyConsumer.priority - 1;
            }
        }
    }

    private move(fromPriority: number, toPriority: number) {
        for (const energyConsumer of this.state.energyConsumers) {
            if (energyConsumer.priority === fromPriority) {
                energyConsumer.priority = toPriority;
            }
        }
    }

    /**
     * Distributes available energy to energy consumers based on their priority.
     */
    private tryDistributeEnergy(): boolean {
        if (!Game.Resources.Power.exists) {
            return false;
        }

        // Implementation: Try to add energy to highest priority consumer, if successful, return
        let sortedConsumers = this.state.energyConsumers.sort((left, right) => left.priority - right.priority); // Sort ascending
        sortedConsumers = sortedConsumers.filter(x => x.priority !== undefined); // Remove undefined priorities (new, never before seen buildings)
        sortedConsumers = sortedConsumers.filter(x => Game.Buildings.getBuilding(x.id).isVisible); // Remove non-visible buildings
        sortedConsumers = sortedConsumers.filter(x => Game.Buildings.getBuilding(x.id).isElectrified); // Remove unelectrified buildings
        let targetPriority: number = undefined;

        for (const energyConsumer of sortedConsumers) {
            let buildingItem = Game.Buildings.getBuilding(energyConsumer.id);

            if (buildingItem.isElectrified && buildingItem.inactiveCount > 0) {
                targetPriority = energyConsumer.priority;
                break;
            }
        }

        if (targetPriority === undefined) {
            // All electrified buildings have power
            return false;
        }

        // From the priority group, pick the building with the least powered count
        let priorityGroup = this.state.energyConsumers.filter(x => x.priority === targetPriority);
        let targetBuilding: BuildingItem = undefined;
        let numMinActive = priorityGroup.reduce((min, x) => Game.Buildings.getBuilding(x.id).activeCount < min && Game.Buildings.getBuilding(x.id).inactiveCount > 0 ? Game.Buildings.getBuilding(x.id).activeCount : min, Number.MAX_VALUE);

        for (const energyConsumer of priorityGroup) {
            let building = Game.Buildings.getBuilding(energyConsumer.id);

            // Building must be visible and electrified
            if (!building.isVisible || !building.isElectrified) {
                continue;
            }

            // Building must have inactive count > 0
            if (building.inactiveCount === 0) {
                continue;
            }

            // Building cost can not be above current power
            if (building.powerConsumption > Game.Resources.Power.count) {
                continue;
            }

            // Building can not have active count > numMinActive to achieve equal distribution
            if (building.activeCount > numMinActive) {
                continue;
            }

            // If no building has been picked yet, pick this one
            if (targetBuilding === undefined) {
                targetBuilding = building;
                continue;
            }

            // Compare which building has the lower active count
            if (targetBuilding.activeCount > building.activeCount) {
                targetBuilding = building;
            }
        }

        if (targetBuilding !== undefined) { // Building to activate has been found, activate it
            Game.Buildings.activate(targetBuilding);
            return true;
        }

        // Implementation: If adding energy fails, check if it is possible to remove energy from one of lower priority buildings
        let deactivationCandidates = this.state.energyConsumers.filter(x => new BuildingItem(x.id).activeCount > 0);
        if (deactivationCandidates.length === 0) { // Nothing to do to improve the situation
            return false;
        }

        // Find the lowest priority and collect all consumer candidates from that priority group
        let deactivationPriority = deactivationCandidates.reduce((max, x) => x.priority > max ? x.priority : max, deactivationCandidates[0].priority);

        if (deactivationPriority < targetPriority) {
            // Don't deactivate higher priority building to power lower priority
            // (happens when priority is fully activated with 0 power left, causing oscillation)
            return false;
        }

        let deactivationPriorityConsumerGroup = this.state.energyConsumers.filter(x => x.priority === deactivationPriority);
        deactivationPriorityConsumerGroup = deactivationPriorityConsumerGroup.filter(x => Game.Buildings.getBuilding(x.id).isVisible); // Remove non-visible buildings
        deactivationPriorityConsumerGroup = deactivationPriorityConsumerGroup.filter(x => Game.Buildings.getBuilding(x.id).isElectrified); // Remove unelectrified buildings
        let deactivationPriorityBuildingGroup = deactivationPriorityConsumerGroup.map(x => new BuildingItem(x.id));

        let mostActive = deactivationPriorityBuildingGroup.reduce((max, x) => x.activeCount > max.activeCount ? x : max, deactivationPriorityBuildingGroup[0]);

        if (Game.Resources.Power.count < 0) { // In case there is deficit of power, just disable the lowest priority building
            console.log(`Power: ${Game.Resources.Power.count}`);
            Game.Buildings.deactivate(mostActive);
            return true;
        }

        if (deactivationPriority === targetPriority) { // If the lowest priority also needs power, check if redistribution is available
            let leastActive = deactivationPriorityBuildingGroup.reduce((min, x) => (x.activeCount < min.activeCount && x.inactiveCount > 0) ? x : min, deactivationPriorityBuildingGroup[0]);

            if (mostActive.activeCount - leastActive.activeCount <= 1) {
                // Energy is distributed evenly
                return false;
            }

            console.log(mostActive, leastActive);
        }


        // Disable a building part from the most active building
        Game.Buildings.deactivate(mostActive);
        return true;
    }
}
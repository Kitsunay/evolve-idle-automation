import { BuildingItem } from "../../game/buildings/building-item";
import { Game } from "../../game/game";
import { Automation } from "../automation";
import { AutoEvolutionInterface } from "./auto-evolution-interface";
import { AutoEvolutionState } from "./auto-evolution-state";
import { EvolutionNode } from "./evolution-node";

export class AutoEvolution extends Automation<AutoEvolutionState> {
    protected LOCAL_STORAGE_KEY: string = "auto-evolve";
    protected state: AutoEvolutionState = {
        unlocked: false,
        enabled: false,
        evolutionRoot: {
            id: "root",
            name: "Root",
            isLeaf: false,
            children: [],
            selectedChildIndex: -1
        },
        targetOrganelles: 0,
        targetMembrane: 0,
        targetNucleus: 0,
        targetMitochondria: 0,
        targetEukaryoticCell: 0
    };

    private static readonly MANDATORY_EVOLUTIONS: string[] = ['multicellular'];

    private gatherTick: number = 0;

    tick(): void {
        if (!Game.Evolution.exists) {
            return;
        }

        this.updateUI();

        // Click the "Gather RNA" and "Generate DNA" buttons to generate starting resources
        this.gatherTick = (this.gatherTick + 1) % 3; // Gather DNA every 3rd tick

        if (this.gatherTick === 0) {
            Game.Evolution.gatherDNA(); // While usually disallowed, this is only resource generation, thus it I consider it as a not-so-important non-blocking action
        } else {
            Game.Evolution.gatherRNA();
        }

        // Buy organelles and nuclei in 2:1 ratio
        let nucleus = Game.Evolution.getBuilding('evolution-nucleus');
        let organelles = Game.Evolution.getBuilding('evolution-organelles');

        if (this.tryPurchaseBuilding(nucleus, this.state.targetNucleus)) {
            return; // Only one action per tick
        }

        let nucleusHasPriority = false;
        if (nucleus) {
            nucleusHasPriority = this.state.targetNucleus > nucleus.level && nucleus.level + 1 < organelles.level / 2; // Can't buy organelles if there is not enough nuclei
        }

        if (!nucleusHasPriority && this.tryPurchaseBuilding(organelles, this.state.targetOrganelles)) {
            return; // Only one action per tick
        }

        if ((organelles.level < this.state.targetOrganelles || nucleus.level < this.state.targetNucleus) && nucleus.isCostStorageable && organelles.isCostStorageable) { // Until production buildings don't run outside of current storage, don't purchase storage
            return;
        }

        // Buy the storage buildings
        let membranes = Game.Evolution.getBuilding('evolution-membrane');
        let mitochondria = Game.Evolution.getBuilding('evolution-mitochondria');
        let eucarioticCell = Game.Evolution.getBuilding('evolution-eukaryotic_cell');

        if (this.tryPurchaseBuilding(membranes, this.state.targetMembrane)) {
            return; // Only one action per tick
        }

        if (this.tryPurchaseBuilding(mitochondria, this.state.targetMitochondria)) {
            return; // Only one action per tick
        }

        if (this.tryPurchaseBuilding(eucarioticCell, this.state.targetEukaryoticCell)) {
            return; // Only one action per tick
        }

        // Do not evolve until all building levels are at target level
        if ((nucleus?.level ?? 0) < this.state.targetNucleus ||
            (organelles?.level ?? 0) < this.state.targetOrganelles ||
            (membranes?.level ?? 0) < this.state.targetMembrane ||
            (mitochondria?.level ?? 0) < this.state.targetMitochondria) {
            return;
        }

        return;

        /*
        // TODO: Finish picking automatic evolution path
        // Collect target evolution path
        /*
        let targetPath: EvolutionNode[] = [];
        let currNode: EvolutionNode = this.state.evolutionRoot.children[this.state.evolutionRoot.selectedChildIndex];
        while (currNode) {
            targetPath.push(currNode);
            currNode = currNode.children[currNode.selectedChildIndex];
        }

        // If interface contains one of the target nodes, EVOLVE
        let availableEvolutions = Game.Evolution.evolutions();

        let targetEvolution = targetPath.find(targetEvolution => availableEvolutions.find(availableEvolution => availableEvolution.id === targetEvolution.id));

        if (targetEvolution) {
            if (!targetEvolution.isPurchasable) { // Wait until the evolution is affordable
                return;
            }

            Game.Evolution.evolve(targetEvolution);
            return;
        }

        // If evolution list does not contain target evolution, check if it is one of mandatory evolutions
        targetEvolution = AutoEvolution.MANDATORY_EVOLUTIONS.find(mandatoryEvolution => availableEvolutions.find(availableEvolution => availableEvolution.id === mandatoryEvolution));

        if (targetEvolution) {
            if (!targetEvolution.isPurchasable) { // Wait until the evolution is affordable
                return;
            }

            Game.Evolution.evolve(targetEvolution);
            return;
        }

        // Something went horribly wrong
        console.error("Could not find target evolution", 'targetPath:', targetPath, 'availableEvolutions:', availableEvolutions, 'mandatoryEvolutions:', AutoEvolution.MANDATORY_EVOLUTIONS);
        throw new Error("Could not find target evolution");
        */
    }

    updateUI(): void {
        AutoEvolutionInterface.update(
            this.state,
            {
                onPauseToggle: this.decorateInterfaceListener(() => this.state.enabled = !this.state.enabled),
                onSub: this.decorateInterfaceListener((buildingId: string) => this.changeTargetLevel(buildingId, -1)),
                onAdd: this.decorateInterfaceListener((buildingId: string) => this.changeTargetLevel(buildingId, 1))
            }
        );
    }

    private tryPurchaseBuilding(building: BuildingItem, targetLevel: number): boolean {
        if (!building) {
            return false;
        }

        if (targetLevel > building.level && building.isPurchasable) {
            Game.Evolution.tryPurchaseBuilding(building);
            return true; // Only one action per tick
        }

        return false;
    }

    private changeTargetLevel(buildingId: string, delta: number) {
        switch (buildingId) {
            case 'evolution-organelles':
                this.state.targetOrganelles = (this.state.targetOrganelles ?? 0) + delta;
                
                if (this.state.targetOrganelles < 0) {
                    this.state.targetOrganelles = 0;
                }

                break;
            case 'evolution-membrane':
                this.state.targetMembrane = (this.state.targetMembrane ?? 0) + delta;

                if (this.state.targetMembrane < 0) {
                    this.state.targetMembrane = 0;
                }

                break;
            case 'evolution-nucleus':
                this.state.targetNucleus = (this.state.targetNucleus ?? 0) + delta;

                if (this.state.targetNucleus < 0) {
                    this.state.targetNucleus = 0;
                }

                break;
            case 'evolution-mitochondria':
                this.state.targetMitochondria = (this.state.targetMitochondria ?? 0) + delta;

                if (this.state.targetMitochondria < 0) {
                    this.state.targetMitochondria = 0;
                }

                break;
            case 'evolution-eukaryotic_cell':
                this.state.targetEukaryoticCell = (this.state.targetEukaryoticCell ?? 0) + delta;

                if (this.state.targetEukaryoticCell < 0) {
                    this.state.targetEukaryoticCell = 0;
                }

                break;
            default:
                throw new Error(`Unknown building id: ${buildingId}`);
        }
    }
}
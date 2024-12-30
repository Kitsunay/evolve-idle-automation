import { Game } from "../game";
import { BuildingItem } from "./building-item";
import { BuildingQueue } from "./building-queue";

export class Buildings {
    public static BuildingQueue = BuildingQueue;

    public static getBuildings() {
        // Get all possible civilization items
        let buildingElements = Array.from(document.querySelectorAll<HTMLElement>('#mTabCivil .tab-item .action'));

        // Filter out actions by class (non-building actions don't have .buttons with cost classes "res-*")
        buildingElements = buildingElements.filter((element) => {
            let button = element.querySelector<Element>('.button');

            for (let i = 0; i < button.classList.length; i++) {
                let buttonClass: string = button.classList.item(i);

                if (buttonClass.startsWith('res-')) {
                    return true;
                }
            }

            return false;
        });

        return buildingElements.map((element) => BuildingItem.fromElement(element));
    }

    public static getBuilding(buildingId: string): BuildingItem {
        return BuildingItem.fromId(buildingId);
    }

    public static tryBuy(building: BuildingItem): boolean {
        if (!building.isPurchasable) {
            return false;
        }

        let numPrevQueueItems = Game.Buildings.BuildingQueue.queueItems.length;
        building.buyButtonElement.dispatchEvent(new Event('click'));
        let numCurrQueueItems = Game.Buildings.BuildingQueue.queueItems.length;

        if (numPrevQueueItems === numCurrQueueItems) {
            return true;
        }

        // If purchase failed and added a queue item, remove the queue item from the queue
        console.error('Failed to buy building', building);
        Game.Buildings.BuildingQueue.queueItems[0].buttonElement.dispatchEvent(new Event('click'));
        return false;
    }

    static activate(targetBuilding: BuildingItem) {
        targetBuilding.activateElement.dispatchEvent(new Event('click'));
    }

    static deactivate(targetBuilding: BuildingItem) {
        targetBuilding.deactivateElement.dispatchEvent(new Event('click'));
    }
}
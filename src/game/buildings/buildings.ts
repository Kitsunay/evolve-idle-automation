import { BuildingItem } from "./building-item";

export class Buildings {
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

        return building.buyButtonElement.dispatchEvent(new Event('click'));
    }
}
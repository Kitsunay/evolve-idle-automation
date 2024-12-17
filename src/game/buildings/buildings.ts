import { BuildingItem } from "./building-item";

export class Buildings {
    public static getBuilding(buildingId: string): BuildingItem {
        return new BuildingItem(buildingId);
    }

    public static tryBuy(building: BuildingItem): boolean {
        if (!building.isPurchasable) {
            return false;
        }

        return building.buyButtonElement.dispatchEvent(new Event('click'));
    }
}
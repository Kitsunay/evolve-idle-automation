import { BuildingItem } from "../buildings/building-item";

export class PowerGrid {
    public static get buildings(): BuildingItem[] {
        // Select power grid element holding all buildings
        let powerGridContainerElement = document.querySelector<HTMLElement>('#powerGrid #gridpower');

        // Collect all visible buildings
        let buildingElements = powerGridContainerElement.querySelectorAll<HTMLElement>(':scope > div:not(.inactive)');

        let buildingIds = Array.from(buildingElements).map((element) => this.extractBuildingId(element.id));

        // Build building item list
        return buildingIds.map((id) => new BuildingItem(id));
    }

    static getBuilding(id: string): BuildingItem {
        let buildingElement = this.getBuildingElement(id);

        if (!buildingElement) {
            return undefined;
        }

        return new BuildingItem(this.extractBuildingId(buildingElement.id));
    }

    static getBuildingElement(id: string): HTMLElement {
        // Select power grid element holding all buildings
        let powerGridContainerElement = document.querySelector<HTMLElement>('#powerGrid #gridpower');

        // Get the building element that contains the given id inside its own id
        return powerGridContainerElement.querySelector<HTMLElement>(`:scope > div[id*=${id}]`);
    }

    /**
     * Pull building id from element id, the element id format is 'pg[buildingId]power', example: pgcity-wardenclyffepower should map to city-wardenclyffe
     * @param id element id of building element
     * @returns 
     */
    private static extractBuildingId(id: string): string {
        return id.substring(2).substring(0, id.length - 7);
    }
}
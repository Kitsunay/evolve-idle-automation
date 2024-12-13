import { Building } from "./building";

export class Buildings {
    public static getBuilding(buildingId: string) {
        return new Building(buildingId);
    }
}
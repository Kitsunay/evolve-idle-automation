import { AutoBuildingItem } from "./auto-building-item";

export interface AutoBuildingConfiguration {
    /**
     * Whether this automation is unlocked
     */
    unlocked: boolean;

    /**
     * The list of buildings with their automation status
     */
    buildings: AutoBuildingItem[];
}
import { AutoBuildingItem } from "./auto-building-item";

export interface AutoBuildingState {
    /**
     * Whether this automation is unlocked
     */
    unlocked: boolean;

    /**
     * Whether this automation is paused
     */
    paused: boolean;

    /**
     * The list of buildings with their automation status
     */
    buildings: AutoBuildingItem[];
}
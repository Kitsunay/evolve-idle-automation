import { Buildings } from "./buildings/buildings";
import { JobList } from "./job-list/job-list";
import { Market } from "./market/market";
import { Military } from "./military/military";
import { PowerGrid } from "./power-grid/power-grid";
import { Research } from "./research/research";
import { Resources } from "./resources/resources";
import { Settings } from "./settings";
import { Storage } from "./storage/storage";

/**
 * Collection of classes that simulate the game's API,
 * translating between the game UI and automation logic
 * (and sometimes with a few blocks of additional logic for convenience).
 */
export class Game {
    public static Buildings = Buildings;
    public static Research = Research;
    public static Settings = Settings;
    public static JobList = JobList;
    public static Resources = Resources;
    public static Storage = Storage;
    public static Market = Market;
    public static PowerGrid = PowerGrid;
    public static Military = Military;
}
import { Buildings } from "./buildings/buildings";
import { JobList } from "./job-list/job-list";
import { Market } from "./market/market";
import { Research } from "./research/research";
import { Resources } from "./resources/resources";
import { Settings } from "./settings";
import { Storage } from "./storage/storage";

export class Game {
    public static Buildings = Buildings;
    public static Research = Research;
    public static Settings = Settings;
    public static JobList = JobList;
    public static Resources = Resources;
    public static Storage = Storage;
    public static Market = Market;
}
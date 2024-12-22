import { Buildings } from "./buildings/buildings";
import { JobList } from "./job-list/job-list";
import { Research } from "./research/research";
import { Resources } from "./resources/resources";
import { Settings } from "./settings";

export class Game {
    public static Buildings = Buildings;
    public static Research = Research;
    public static Settings = Settings;
    public static JobList = JobList;
    public static Resources = Resources;
}
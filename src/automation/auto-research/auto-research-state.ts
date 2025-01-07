import { ResearchChoiceList } from "./research-choice";

export interface AutoResearchState {
    /**
     * Whether this automation is unlocked
    */
    unlocked: boolean;

    /**
     * Whether this automation is enabled
     */
    enabled: boolean;

    /**
     * List of researches that have been researched and can be automated
     */
    knownResearches: Set<string>;

    /**
     * List of research choices
     */
    researchChoices: ResearchChoiceList[];
}
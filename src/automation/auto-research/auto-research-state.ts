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
}
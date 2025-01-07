export interface ResearchChoiceList {
    id: string;
    researches: {
        id: string;
        name: string;
        isDiscovered: boolean;
    }[];
    selectedResearchIndex: number;
}
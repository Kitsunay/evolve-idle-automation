export interface AutoMilitaryState {
    unlocked: boolean;
    enabled: boolean;
    autoBattle: {
        unlocked: boolean;
        enabled: boolean;
        targetId: string;
    }
}
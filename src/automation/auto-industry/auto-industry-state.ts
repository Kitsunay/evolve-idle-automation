export interface AutoIndustryState {
    unlocked: boolean;
    enabled: boolean;
    smelterConfig: {
        unlocked: boolean;
        enabled: boolean;
        preferredFuel: string;
        productRatios: { product: string, ratio: number }[];
    },
    factoryConfig: {
        unlocked: boolean;
        enabled: boolean;
        productRatios: { product: string, ratio: number }[];
    }
}
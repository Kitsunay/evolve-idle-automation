import { AutoMarketItem } from "./auto-market-item";

export interface AutoMarketState {
    unlocked: boolean;
    items: AutoMarketItem[];
}
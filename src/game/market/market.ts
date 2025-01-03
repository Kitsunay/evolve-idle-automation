import { Game } from "../game";
import { MarketResourceItem } from "./market-resource-item";
import { ResourceTabRefreshObserver } from "./observers/resource-tab-refresh-observer";

export class Market {
    public static readonly onResourceTabRefresh = new ResourceTabRefreshObserver();

    public static get isUnlocked(): boolean {
        // Check if market tab is rendered
        return document.querySelector('#mTabResource .tabs ul > :nth-child(1):not([style="display: none;"])') ? true : false;
    }

    public static getResources(): MarketResourceItem[] {
        // Get all resource ids
        let resourceElements = document.querySelectorAll<HTMLElement>('#market [id^="market-"]:not(:first-child):not([style="display: none;"])');
        let resourceIds = Array.from(resourceElements).map((element) => element.id);

        // Build resource item list
        return resourceIds.map((id) => new MarketResourceItem(id));
    }

    public static get isTradeRouteUnlocked(): boolean {
        return document.querySelector('#market #tradeTotal:not([style="display: none;"])') ? true : false;
    }

    public static get freeTradeRouteCount(): number {
        //let usedTradeRouteCount = document.querySelector('#market #tradeTotal .tradeTotal span:nth-child(2)');

        // Get element with trade routes summary
        let tradeRouteCountSummaryElement = document.querySelector('#market #tradeTotal .tradeTotal');
        let splitString = tradeRouteCountSummaryElement.textContent.split(' ');

        // Used trades is third element from end, total trades is last element
        let usedTradeRouteCount = splitString[splitString.length - 3];
        let totalTradeRouteCount = splitString[splitString.length - 1];

        // Calculate free trade routes
        return parseFloat(totalTradeRouteCount) - parseFloat(usedTradeRouteCount);
    }

    public static get usedTradeRouteCount(): number {
        // Get element with trade routes summary
        let tradeRouteCountSummaryElement = document.querySelector('#market #tradeTotal .tradeTotal');
        let splitString = tradeRouteCountSummaryElement.textContent.split(' ');

        // Used trades is third element from end
        let usedTradeRouteCount = splitString[splitString.length - 3];
        return parseFloat(usedTradeRouteCount);
    }


    public static get totalTradeRouteCount(): number {
        // Get element with trade routes summary
        let tradeRouteCountSummaryElement = document.querySelector('#market #tradeTotal .tradeTotal');
        let splitString = tradeRouteCountSummaryElement.textContent.split(' ');

        // Total trades is last element
        let totalTradeRouteCount = splitString[splitString.length - 1];
        return parseFloat(totalTradeRouteCount);
    }

    public static get maxTradeRoutesPerResource(): number {
        // The trade limit is not detectable, so we have to employ a more brute force approach - fuck around and find out what affects the limit

        // If research "Large Volume Trading" is unlocked, the limit is 100
        if (Game.Research.completedResearches.find(research => research.id === 'tech-large_trades')) {
            return 100;
        }

        // Default trade limit is 25
        return 25;
    }


    public static addBuyTrade(targetResource: MarketResourceItem) {
        this.addTrade(targetResource);
    }

    public static addSellTrade(targetResource: MarketResourceItem) {
        this.subTrade(targetResource);
    }

    public static subBuyTrade(targetResource: MarketResourceItem) {
        this.subTrade(targetResource);
    }

    public static subSellTrade(targetResource: MarketResourceItem) {
        this.addTrade(targetResource);
    }

    private static addTrade(targetResource: MarketResourceItem) {
        targetResource.addButton.dispatchEvent(new Event('click'));
    }

    private static subTrade(targetResource: MarketResourceItem) {
        targetResource.subButton.dispatchEvent(new Event('click'));
    }
}
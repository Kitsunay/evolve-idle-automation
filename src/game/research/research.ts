import { ResearchItem } from "./research-item";

export class Research {
    /**
     * Returns a list of researches that can be purchased.
     * @returns 
     */
    public static getPurchasableResearches(): ResearchItem[] {
        return this.getAvailableResearches().filter((research) => research.isPurchasable());
    }

    /**
     * Returns a list of researches that are visible.
     * @returns 
     */
    public static getAvailableResearches(): ResearchItem[] {
        // Collect ids of all visible research elements
        let researchElements = document.querySelectorAll<HTMLElement>('#tech [id^="tech-"]');

        return Array.from(researchElements).map((element) => new ResearchItem(element.id));
    }

    /**
     * Attempt to click the purchasable research button to buy the research.
     * @param research research to purchase
     * @returns true is purchase was successful, false otherwise
     */
    static tryBuyResearch(research: ResearchItem): boolean {
        if (!research.isPurchasable()) {
            return false;
        }

        return research.buyButtonElement.dispatchEvent(new Event('click'));
    }
}
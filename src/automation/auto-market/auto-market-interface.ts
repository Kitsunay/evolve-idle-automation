import { ToggleButton } from "../../interface/components/toggle-button/toggle-button";
import { Interface } from "../../interface/interface";

export class AutoMarketInterface {
    static refreshBuyButton(resourceId: string, buyEnabled: boolean, onToggle: () => void) {
        let containerElement = this.refreshButtonContainer(resourceId);

        let toggleButton = ToggleButton.createIfNotExists(`auto_market_buy_${resourceId}`, containerElement, { styleClass: "auto-market buy", textContent: {on: "BUY", off: "BUY"}});
        toggleButton.onToggle = onToggle;
        toggleButton.isToggled = buyEnabled;
    }

    static refreshSellButton(resourceId: string, sellEnabled: boolean, onToggle: () => void) {
        let containerElement = this.refreshButtonContainer(resourceId);

        let toggleButton = ToggleButton.createIfNotExists(`auto_market_sell_${resourceId}`, containerElement, { styleClass: "auto-market sell", textContent: {on: "SELL", off: "SELL"}});
        toggleButton.onToggle = onToggle;
        toggleButton.isToggled = sellEnabled;
    }

    private static refreshButtonContainer(resourceId: string): Element {
        let marketElement = document.querySelector<HTMLElement>(`#market`);
        let resourceElement = marketElement.querySelector<HTMLElement>(`#${resourceId}`);
        let containerElement = resourceElement.querySelector<Element>(`#auto_market_container_${resourceId}`);

        if (!containerElement) {
            let elementString = `<div id="auto_market_container_${resourceId}" class="auto-market-container"></div>`;
            containerElement = Interface.createChildElementFromString(elementString, resourceElement);
        }

        return containerElement;
    }
}
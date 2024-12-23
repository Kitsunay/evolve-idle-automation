import { Interface } from "../../interface/interface";

export class AutoMarketInterface {
    static refreshBuyButton(resourceId: string, buyEnabled: boolean, onClick: () => void) {
        let containerElement = this.refreshButtonContainer(resourceId);

        let elementId = `auto_market_buy_${resourceId}`;
        let buyButtonElement = containerElement.querySelector(`#${elementId}`);

        if (!buyButtonElement) {
            let elementString = `<div id="${elementId}" class="auto auto-market buy"><span>A.BUY</span></div>`;
            buyButtonElement = Interface.createChildElementFromString(elementString, containerElement, 0);
            buyButtonElement.addEventListener('click', onClick);
        }

        if (buyButtonElement.classList.contains('on') !== buyEnabled) {
            buyButtonElement.classList.toggle('on');
        }
    }

    static refreshSellButton(resourceId: string, sellEnabled: boolean, onClick: () => void) {
        let containerElement = this.refreshButtonContainer(resourceId);

        let elementId = `auto_market_sell_${resourceId}`;
        let sellButtonElement = containerElement.querySelector(`#${elementId}`);

        if (!sellButtonElement) {
            let elementString = `<div id="${elementId}" class="auto auto-market sell"><span>A.SELL</span></div>`;
            sellButtonElement = Interface.createChildElementFromString(elementString, containerElement, 0);
            sellButtonElement.addEventListener('click', onClick);
        }

        if (sellButtonElement.classList.contains('on') !== sellEnabled) {
            sellButtonElement.classList.toggle('on');
        }
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
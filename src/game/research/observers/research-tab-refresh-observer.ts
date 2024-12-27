import { ElementObserver } from "../../common/element-observer";

export class ResearchTabRefreshObserver extends ElementObserver {
    protected observedElement: HTMLElement = document.querySelector<HTMLElement>('#mTabResearch');
    protected observerConfig: MutationObserverInit = { childList: true };
}
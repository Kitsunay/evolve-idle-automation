import { ElementObserver } from "../../common/element-observer";

export class ResourceTabRefreshObserver extends ElementObserver {
    protected observedElement: HTMLElement = document.querySelector<HTMLElement>('#mTabResource');
    protected observerConfig: MutationObserverInit = { childList: true };
}
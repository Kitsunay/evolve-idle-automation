import { ElementObserver } from "../../common/element-observer";

export class ResourceTabRefreshObserver extends ElementObserver {
    protected observedElement: HTMLElement = document.querySelector<HTMLElement>('#market');
    protected observerConfig: MutationObserverInit = { childList: true, attributes: true };
}
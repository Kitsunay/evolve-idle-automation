import { Observer } from "./observer";

export class ResearchTabRefreshObserver extends Observer<() => void> {
    protected observedElement: HTMLElement = document.querySelector<HTMLElement>('#mTabResearch');
    protected observerConfig: MutationObserverInit = { childList: true };

    protected onMutation(mutationList: MutationRecord[], observer: MutationObserver, listeners: Map<string, () => void>): void {
        listeners.forEach(callback => callback());
    }

    protected init(): void {
        // Do nothing
    }
}
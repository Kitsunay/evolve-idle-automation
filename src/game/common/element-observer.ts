import { Observer } from "./observer";

/**
 * A very simple implementation for watching changes on a static element without additional logic
 */
export abstract class ElementObserver extends Observer<() => void> {
    protected abstract observedElement: HTMLElement;
    protected abstract observerConfig: MutationObserverInit;

    protected onMutation(mutationList: MutationRecord[], observer: MutationObserver, listeners: Map<string, () => void>): void {
        listeners.forEach(callback => callback());
    }

    protected init(): void {
        // Do nothing
    }
}
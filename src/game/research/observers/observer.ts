export abstract class Observer<CALLBACK> {
    private mutationObserver: MutationObserver = undefined;
    private listeners = new Map<string, CALLBACK>();

    protected abstract observedElement: HTMLElement;
    protected abstract observerConfig: MutationObserverInit;

    /**
     * Adds a callback to be called when an action takes place
     * @param callback function to be called when observer fires an event
     * @param callbackId unique id for the callback to avoid duplicates, if specified, new callback will always replace the old one, otherwise only callbacks with the same code will not be duplicated
     */
    public addListener(callback: CALLBACK, callbackId?: string) {
        if (!this.mutationObserver) {
            this.mutationObserver = new MutationObserver((mutationList, observer) => {
                this.onMutation(mutationList, observer, this.listeners); // Let the inheritor define the internal logic, without all this boilerplate code
            });

            this.mutationObserver.observe(this.observedElement, this.observerConfig);
        }

        if (!callbackId) {
            callbackId = callback.toString(); // In case callback id was not provided, callback's actual code can be used as unique id
        }

        this.init();

        this.listeners.set(callbackId, callback);
    }

    /**
     * Defines the internal logic of the observer and when bound listeners are called
     * @param mutationList 
     * @param observer 
     */
    protected abstract onMutation(mutationList: MutationRecord[], observer: MutationObserver, listeners: Map<string, CALLBACK>): void;

    /**
     * A chance for the inheritor to initialize the observer before any event is fired
     */
    protected abstract init(): void;
}
export abstract class Automation<STATE> {
    protected abstract readonly LOCAL_STORAGE_KEY: string;
    protected abstract state: STATE;
    
    abstract init(): void;
    abstract tick(): void;
    abstract updateUI(): void;

    /**
     * Generic method to save automation state to local storage, including non-primitive types.
     * Currently supports: Sets
     * More types can be added in the future.
     */
    protected saveState(): void {
        localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.state, (key, value) => {
            // Properly stringify Set objects
            if (value instanceof Set) {
                return Array.from(value);
            }

            if (Array.isArray(value)) { // Don't break arrays
                return value;
            }

            // Rename keys with special value types by replacing the original value (breaks arrays)
            if (value instanceof Object) { // Avoids recursion for strings???
                let replacement: any = {};

                for (const key in value) {
                    if (Object.hasOwnProperty.call(value, key)) {
                        let newKey = key;
                        
                        if (value[key] instanceof Set) {
                            newKey = `${key}<Set>`; // Annotate Set objects for identification during revival
                        }
                        
                        replacement[newKey] = value[key];
                    }
                }

                value = replacement;
            }

            return value;
        }));
    }

    protected loadState(): void {
        this.state = this.loadStateObject();
    }

    /**
     * Generic method to load automation state from local storage, including non-primitive types.
     * Currently supports: Sets
     * More types can be added in the future.
     */
    protected loadStateObject(): STATE {
        return JSON.parse(localStorage.getItem(this.LOCAL_STORAGE_KEY), (key, value) => {
            // Properly revive Set objects
            if (key.search('<Set>') !== -1) {
                return new Set<any>(value);
            }

            if (Array.isArray(value)) { // Don't break arrays
                return value;
            }

            // Rename special tags from keys by replacing the original value
            if (value instanceof Object) { // Avoids recursion for strings???
                let replacement: any = {};

                for (const key in value) {
                    if (Object.hasOwnProperty.call(value, key)) {
                        let newKey = key;
                        
                        if (key.search('<Set>') !== -1) {
                            newKey = key.slice(0, key.search('<Set>')); // Remove annotation of Set objects after revival
                        }
                        
                        replacement[newKey] = value[key];
                    }
                }

                value = replacement;
            }

            return value;
        });
    }
}
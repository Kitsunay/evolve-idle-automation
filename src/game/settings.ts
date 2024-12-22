export class Settings {
    /**
     * Setting that affects rendering of inactive tabs.
     *  When on, inactive tabs are rendered with 'display: none',
     *  allowing Automations to run anyway. When off,
     *  Automations can affect only currently visible tab.
     */
    static get preloadTabContent(): boolean {
        // Through a massive selector, find the setting element and check if the setting is set to 'checked'
        if (document.querySelector('#settings .settings11')?.parentElement?.parentElement?.querySelector('input[type="checkbox"]:checked')) {
            return true;
        }

        return false;
    }
}
export class Perks {
    private static get mainElement(): HTMLElement {
        return document.querySelector<HTMLElement>('#perksPanel');
    }

    public static hasPerk(perk: string): boolean {
        let elements = this.mainElement.querySelectorAll<HTMLElement>(`.achievement :first-child)`);

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            
            if (element.textContent.trim() === perk) {
                return true;
            }
        }

        return false;
    }
}
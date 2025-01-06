import { BuildingItem } from "../buildings/building-item";
import { Clicker } from "../clicker";

export class Evolution {
    private static ALLOWED_BUILDINGS = ['evolution-organelles', 'evolution-nucleus', 'evolution-membrane', 'evolution-eukaryotic_cell', 'evolution-mitochondria'];

    public static get exists(): boolean {
        let element = document.querySelector<HTMLElement>('#evolution:not([style="display: none;"])');

        return !!element;
    }

    public static gatherRNA(): void {
        this.gatherResource('rna');
    }

    public static gatherDNA(): void {
        this.gatherResource('dna');
    }

    private static gatherResource(resource: 'rna' | 'dna') {
        let resourceElement = document.querySelector<HTMLElement>(`#evolution-${resource} .button`);

        if (!resourceElement) {
            return;
        }

        Clicker.click(resourceElement);
    }

    public static getBuilding(id: string): BuildingItem {
        if (!this.ALLOWED_BUILDINGS.includes(id)) {
            throw new Error(`Building ${id} is not allowed`);
        }

        let buildingElement = document.querySelector<HTMLElement>(`#${id}`);

        
        if (!buildingElement) {
            return undefined;
        }

        return BuildingItem.fromElement(buildingElement);
    }

    public static tryPurchaseBuilding(building: BuildingItem): boolean {
        if (!building.isPurchasable) {
            return false;
        }

        Clicker.click(building.buyButtonElement);
        return true;
    }
}
export class Military {
    static get maxSoldiers(): number {
        let soldiersText = this.bunksElement.children.item(0).textContent;

        let parseRegex = /\S (\d+) \/ (\d+)/g;

        let match = parseRegex.exec(soldiersText);

        return parseInt(match[2]);
    }

    static get soldiers(): number {
        let soldiersText = this.bunksElement.children.item(0).textContent;

        let parseRegex = /\S (\d+) \/ (\d+)/g;

        let match = parseRegex.exec(soldiersText);

        return parseInt(match[1]);
    }

    static get woundedSoldiers(): number {
        let woundedSoldiersElement = this.bunksElement.children.item(2).children.item(1);

        return parseInt(woundedSoldiersElement.textContent);
    }

    private static get bunksElement(): HTMLElement {
        return document.querySelector<HTMLElement>('#c_garrison .bunks');
    }

    static attack(targetId: string) {
        let attackButton = document.querySelector<HTMLElement>(`#${targetId} .attack`);
        attackButton.dispatchEvent(new Event('click'));
    }

}
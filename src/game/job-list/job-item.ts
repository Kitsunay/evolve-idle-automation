export class JobItem {
    public readonly id: string;
    public readonly element: HTMLElement;

    public get isDefault(): boolean {
        // Default job has an asterisk "*" as the last character of its name, e.g. Farmer*
        let nameElement = this.element.querySelector<Element>('.job_label h3');

        // Dig down the children if there are any
        while (nameElement.children.length > 0) {
            nameElement = nameElement.children[0];
        }

        return nameElement.textContent[nameElement.textContent.length - 1] === '*';
    }

    public get isActive(): boolean {
        return this.element.attributes.getNamedItem('style')?.value !== 'display: none;';
    }

    public get count(): number {
        let countString = this.element.querySelector<HTMLElement>('.count').textContent;
        
        // If has max, return only count (e.g. from string 3 / 15 return only 3)
        if (countString.indexOf('/') > 0) {
            countString = countString.substring(0, countString.indexOf('/'));
        }

        return parseInt(countString);
    }

    public get countMax(): number {
        let countString = this.element.querySelector<HTMLElement>('.count').textContent;
        
        // If has max, return only max (e.g. from string 3 / 15 return only 15), otherwise return undefined
        if (countString.indexOf('/') < 0) {
            return undefined;
        }
        
        countString = countString.substring(countString.indexOf('/') + 1);
        return parseInt(countString);
    }

    public get subElement(): HTMLElement {
        if (this.isDefault) {
            return undefined; // You can't add/sub to default job
        }

        let element = this.element.querySelector<HTMLElement>('.sub');

        if (!element) { // This happens with crafters
            element = this.element.parentElement.querySelector<HTMLElement>('.sub');
        }

        return element;
    }

    public get addElement(): HTMLElement {
        if (this.isDefault) {
            return undefined; // You can't add/sub to default job
        }

        let element = this.element.querySelector<HTMLElement>('.add');

        if (!element) { // This happens with crafters
            element = this.element.parentElement.querySelector<HTMLElement>('.add');
        }

        return element;
    }

    public static fromElement<T extends JobItem>(this: {new(jobId: string, element: HTMLElement): T}, element: HTMLElement): T {
        return new this(undefined, element);
    }

    public static fromId<T extends JobItem>(this: {new(jobId: string, element: HTMLElement): T}, jobId: string): JobItem {
        return new this(jobId, undefined);
    }

    constructor(jobId: string = undefined, element: HTMLElement = undefined) {
        if (element) {
            this.element = element;
            this.id = element.id;
            return;
        }

        if (jobId) {
            this.id = jobId;
            this.element = document.querySelector<HTMLElement>(`#${jobId}`);
        }
    }
}
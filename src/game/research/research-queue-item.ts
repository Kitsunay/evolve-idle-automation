import { ResearchQueueItemInterface } from "../../interface/research/research-queue-item-interface";

export class ResearchQueueItem {
    private interface: ResearchQueueItemInterface;

    constructor (researchQueueItemInterface: ResearchQueueItemInterface) {
        this.interface = researchQueueItemInterface;
    }
}
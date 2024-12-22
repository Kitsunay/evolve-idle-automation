import { FoundryJobCategoryItem } from "./foundry/foundry-job-category-item";
import { JobCategoryItem } from "./job-category-item";
import { JobItem } from "./job-item";
import { UncategorizedJobCategoryItem } from "./uncategorized/uncategorized-job-category-item";

export class JobList {
    private static jobCategories: JobCategoryItem[] = [new UncategorizedJobCategoryItem(), new FoundryJobCategoryItem()];

    public static getCategories(): JobCategoryItem[] {
        return this.jobCategories;
    }

    public static getJobs(): JobItem[] {
        return this.jobCategories.flatMap((category) => category.jobs);
    }

    public static getJob(jobId: string): JobItem {
        return JobItem.fromId(jobId);
    }

    public static addWorker(jobElement: JobItem): void {
        jobElement.addElement.dispatchEvent(new Event('click'));
    }

    public static removeWorker(jobElement: JobItem): void {
        jobElement.subElement.dispatchEvent(new Event('click'));
    }
}
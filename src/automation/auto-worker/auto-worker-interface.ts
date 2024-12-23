import { Interface } from "../../interface/interface";
import { AutoWorkerJobRatio } from "./auto-worker-job-ratio";

export class AutoWorkerInterface {
    static refreshEnableButton(enabled: boolean, onClick: () => void) {
        let rootElement = document.querySelector<HTMLElement>(`#civics .jobList`);
        let autoWorkerRootElement: Element = rootElement.querySelector<Element>(`.auto-worker`);

        // Add root element
        if (!autoWorkerRootElement) {
            let elementString = `<div class="auto-worker"></div>`;
            autoWorkerRootElement = Interface.createChildElementFromString(elementString, rootElement, 0);
        }

        // Add on/off button
        let autoWorkerButtonElement = autoWorkerRootElement.querySelector<Element>('.auto');

        if (!autoWorkerButtonElement) {
            let elementString = `<div class="auto"><span>Auto-Worker</span></div>`;
            autoWorkerButtonElement = Interface.createChildElementFromString(elementString, autoWorkerRootElement, 0);
            autoWorkerButtonElement.addEventListener('click', onClick);
        }

        // Add 'Automation' label
        let autoWorkerLabelElement = autoWorkerRootElement.querySelector<Element>('#auto-worker-label');
        if (!autoWorkerLabelElement) {
            let autoWorkerLabelElementString = '<div id="auto-worker-label" class="has-text-warning">Automation</div>';
            autoWorkerLabelElement = Interface.createChildElementFromString(autoWorkerLabelElementString, autoWorkerRootElement, 0);
        }

        // Update element's value (on/off)
        if (autoWorkerButtonElement.classList.contains('on') !== enabled) {
            autoWorkerButtonElement.classList.toggle('on');
        }
    }

    static refreshJobRatios(jobs: AutoWorkerJobRatio[], onClick: () => void) {
        for (const job of jobs) {
            let jobRatioElement: Element = document.querySelector<HTMLElement>(`#${job.jobId}_job_ratio`);

            if (!jobRatioElement) {
                let label: string;

                switch (job.jobId) {
                    case 'civ-farmer':
                        // Farmer is a special case of worker because it is required for food production
                        label = 'Auto-Food /s';
                        break;
                    default:
                        label = 'Auto-Ratio';
                }

                // Job ratio is a sibling element below the job amount configuration
                let jobRootElement = document.querySelector<HTMLElement>(`#${job.jobId}`);

                // Skip jobs that are not visible
                if (!jobRootElement || jobRootElement.style.display === 'none') {
                    continue;
                }

                if (jobRootElement.classList.contains('job_label')) {
                    // 'job_label' class indicates that the root element for the job is too deepin the tree and sibling must be created higher
                    // this is the case with foundry jobs for example
                    jobRootElement = jobRootElement.parentElement;
                }

                jobRatioElement = Interface.createSiblingElementFromString(`<div id="${job.jobId}_job_ratio" class="auto-worker-row job-ratio"><div>${label}</div><div class="value">${job.value}</div><div class="controls"><div class="controls"><span role="button" class="sub has-text-danger"><span>«</span></span><span role="button" class="add has-text-success"><span>»</span></span></div></div></div>`, jobRootElement);

                // Add event listeners to increase/decrease the ratio
                let subElement = jobRatioElement.querySelector('.sub');
                let addElement = jobRatioElement.querySelector('.add');

                subElement.addEventListener('click', () => {
                    job.value = Math.max(0, job.value - 1);
                    onClick();

                    this.refreshJobRatios(jobs, onClick);
                });
                addElement.addEventListener('click', () => {
                    job.value = job.value + 1;
                    onClick();

                    this.refreshJobRatios(jobs, onClick);
                });
            }

            // Make sure the ratio is showing the correct value
            jobRatioElement.querySelector('.value').textContent = job.value.toString();
        }
    }
}
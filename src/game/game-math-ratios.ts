export class GameMathRatios {
    public static calculateRatiosWithCaps(value: number, ratios: number[], valueCaps: number[]): number[] {
        // Calculate result the standard way
        let intResult = this.calculateIntRatios(ratios, value);

        // Find indexes of values that overflow the cap
        let cappedIndexes: number[] = []; // Indexes of values that overflow the cap

        for (let i = 0; i < intResult.length; i++) {
            if (valueCaps[i] !== undefined && intResult[i] > valueCaps[i]) {
                cappedIndexes.push(i);
                intResult[i] = valueCaps[i];
            }
        }

        if (cappedIndexes.length === 0) { // No overflow, return the result
            //console.log(`expected ${value} total ${intResult.reduce((a, b) => a + b, 0)}`);
            return intResult;
        }

        // Cap overflow happened, rerun the calculation without the overflowed values in the arrays
        // Drop the dustributed value by capped values
        let newValue = value - cappedIndexes.map(x => intResult[x]).reduce((a, b) => a + b, 0);

        // Generate new arrays for ratios and caps without overflowed values in the arrays
        let newRatios = ratios.filter((x, i) => !cappedIndexes.includes(i));
        let newCaps = valueCaps.filter((x, i) => !cappedIndexes.includes(i));

        let subResult = this.calculateRatiosWithCaps(newValue, newRatios, newCaps);

        // Merge sub-result with the overflowed values
        for (let i = 0; i < cappedIndexes.length; i++) {
            subResult.splice(cappedIndexes[i], 0, intResult[cappedIndexes[i]]);
        }

        return subResult;
    }

    public static calculateIntRatios(ratios: number[], value: number, minValues?: number[]): number[] {
        // Calculate result the standard way
        let floatResult = this.calculateRatios(ratios, value, minValues);

        // Find the closest whole number and calculate the remainder
        let intResult = floatResult.map((x) => Math.floor(x));
        let remainder = 0;
        for (let i = 0; i < intResult.length; i++) {
            intResult[i] = Math.min(intResult[i]);
            remainder += floatResult[i] - intResult[i];
        }

        // Apply the remainder to the lowest difference
        let maxSortedIndexes: number[] = [];
        let maxSortedDiffs: number[] = [];
        for (let i = 0; i < intResult.length; i++) {
            let diff = floatResult[i] - intResult[i];

            // Insert value and keep the arrays sorted
            if (maxSortedDiffs.length === 0 || diff >= maxSortedDiffs[0]) {
                maxSortedIndexes.unshift(i);
                maxSortedDiffs.unshift(diff);
                continue;
            } else if (diff <= maxSortedDiffs[maxSortedDiffs.length - 1]) {
                maxSortedIndexes.push(i);
                maxSortedDiffs.push(diff);
                continue;
            }

            let left = 0;
            let right = maxSortedIndexes.length - 1;
            while (true) {
                let middle = Math.floor((left + right) / 2);

                if (middle === right || middle === left) {
                    if (diff > maxSortedDiffs[middle]) {
                        maxSortedIndexes.splice(middle, 0, i);
                        maxSortedDiffs.splice(middle, 0, diff);
                    } else {
                        maxSortedIndexes.splice(middle + 1, 0, i);
                        maxSortedDiffs.splice(middle + 1, 0, diff);
                    }

                    break;
                }

                if (diff > maxSortedDiffs[middle]) {
                    right = middle;
                } else if (diff < maxSortedDiffs[middle]) {
                    left = middle;
                } else {
                    maxSortedIndexes.splice(middle, 0, i);
                    maxSortedDiffs.splice(middle, 0, diff);
                    break;
                }
            }
        }

        // Apply the remainder by increments to int result, starting from the highest difference
        for (let i = 0; i < maxSortedIndexes.length; i++) {
            let index = maxSortedIndexes[i];

            remainder = Math.round(remainder); // Avoids float precision issues
            if (remainder <= 0) {
                break;
            }

            intResult[index] += 1;
            remainder -= 1;
        }

        return intResult;
    }

    static calculateRatios(ratios: number[], value: number, minValues?: number[]): number[] {
        // Normalize the ratios first
        ratios = this.normalizeRatios(ratios);

        // Calculate result the standard way
        let floatResult = ratios.map((x) => x * value);

        if (!minValues) {
            return floatResult;
        }

        // If minValues are set, check if all values meet the min value threshold
        let cappedIndexes: number[] = [];

        if (minValues) {
            for (let i = 0; i < floatResult.length; i++) {
                if (floatResult[i] < minValues[i]) {
                    value -= minValues[i];

                    cappedIndexes.push(i);
                }
            }

            if (cappedIndexes.length > 0) {
                // Recalculate non-anchored ratios with new target total after applying min values. 
                let newRatios = ratios.filter((x, i) => !cappedIndexes.includes(i));
                let newMinValues = minValues.filter((x, i) => !cappedIndexes.includes(i));
                floatResult = this.calculateRatios(newRatios, value, newMinValues);

                // Re-merge the result with capped values
                for (let i = 0; i < cappedIndexes.length; i++) {
                    floatResult.splice(cappedIndexes[i], 0, minValues[cappedIndexes[i]]);
                }
            }
        }

        return floatResult;
    }

    static normalizeRatios(ratios: number[], targetTotal: number = 1) {
        let totalRatios = ratios.reduce((a, b) => a + b, 0); // Get current ratio total
        return ratios.map(x => {
            if (totalRatios === 0) {
                return 0;
            }

            return (x / totalRatios) * targetTotal; // Calculate normalized ratio and adjust to target total
        });
    }
}
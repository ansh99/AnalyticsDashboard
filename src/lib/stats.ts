export function getNumericColumns(headers: string[], types: Record<string, string>) {
    return headers.filter(h => types[h] === 'number');
}

export function computeStats(data: any[], column: string) {
    let values = data.map(row => Number(row[column])).filter(val => !isNaN(val));
    if (values.length === 0) return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0, missing: data.length };

    values.sort((a, b) => a - b);

    const missing = data.length - values.length;
    const min = values[0];
    const max = values[values.length - 1];

    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;

    const mid = Math.floor(values.length / 2);
    const median = values.length % 2 !== 0 ? values[mid] : (values[mid - 1] + values[mid]) / 2;

    const squareDiffs = values.map(v => Math.pow(v - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(avgSquareDiff);

    return { mean, median, stdDev, min, max, missing };
}

export function computeCorrelation(data: any[], colA: string, colB: string) {
    const valuesA: number[] = [];
    const valuesB: number[] = [];

    for (let i = 0; i < data.length; i++) {
        const a = Number(data[i][colA]);
        const b = Number(data[i][colB]);
        if (!isNaN(a) && !isNaN(b)) {
            valuesA.push(a);
            valuesB.push(b);
        }
    }

    if (valuesA.length === 0) return 0;

    const meanA = valuesA.reduce((a, b) => a + b, 0) / valuesA.length;
    const meanB = valuesB.reduce((a, b) => a + b, 0) / valuesB.length;

    let numerator = 0;
    let denomA = 0;
    let denomB = 0;

    for (let i = 0; i < valuesA.length; i++) {
        const diffA = valuesA[i] - meanA;
        const diffB = valuesB[i] - meanB;
        numerator += diffA * diffB;
        denomA += diffA * diffA;
        denomB += diffB * diffB;
    }

    const denominator = Math.sqrt(denomA * denomB);
    if (denominator === 0) return 0;

    return numerator / denominator;
}

export function getHistogramData(data: any[], column: string, bins = 10) {
    const values = data.map(row => Number(row[column])).filter(val => !isNaN(val));
    if (values.length === 0) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const binSize = range / bins;

    const histogram = Array.from({ length: bins }, (_, i) => ({
        binStart: min + i * binSize,
        binEnd: min + (i + 1) * binSize,
        count: 0,
        label: `${(min + i * binSize).toFixed(1)} - ${(min + (i + 1) * binSize).toFixed(1)}`
    }));

    values.forEach(val => {
        let index = Math.floor((val - min) / binSize);
        if (index >= bins) index = bins - 1;
        histogram[index].count++;
    });

    return histogram;
}

export function getMissingValuesAnalysis(data: any[], headers: string[]) {
    const result = headers.map(header => {
        let missing = 0;
        for (let i = 0; i < data.length; i++) {
            const val = data[i][header];
            if (val === null || val === undefined || val === '') missing++;
        }
        return {
            column: header,
            missing,
            percentage: (missing / data.length) * 100
        };
    });
    return result.sort((a, b) => b.percentage - a.percentage);
}

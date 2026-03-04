import * as tf from '@tensorflow/tfjs';

export async function runRegression(data: any[], targetCol: string, featureCols: string[]) {
    // Filter out invalid rows
    const cleanData = data.filter(row => {
        if (isNaN(Number(row[targetCol]))) return false;
        for (const f of featureCols) {
            if (isNaN(Number(row[f]))) return false;
        }
        return true;
    });

    if (cleanData.length < 10) throw new Error("Not enough valid numeric data for regression.");

    // Prepare tensors
    const xs = tf.tensor2d(cleanData.map(row => featureCols.map(f => Number(row[f]))));
    const ys = tf.tensor2d(cleanData.map(row => [Number(row[targetCol])]));

    // Normalize
    const xsMin = xs.min(0);
    const xsMax = xs.max(0);
    const xsRange = xsMax.sub(xsMin).add(1e-7); // avoid div by 0
    const normXs = xs.sub(xsMin).div(xsRange);

    const ysMin = ys.min(0);
    const ysMax = ys.max(0);
    const ysRange = ysMax.sub(ysMin).add(1e-7);
    const normYs = ys.sub(ysMin).div(ysRange);

    // Model
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 16, activation: 'relu', inputShape: [featureCols.length] }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({ optimizer: tf.train.adam(0.01), loss: 'meanSquaredError' });

    // Train
    await model.fit(normXs, normYs, {
        epochs: 50,
        batchSize: Math.min(32, cleanData.length),
        shuffle: true,
    });

    // Predict
    const predsNorm = model.predict(normXs) as tf.Tensor;
    const preds = predsNorm.mul(ysRange).add(ysMin);

    const ysArray = await ys.array() as number[][];
    const predsArray = await preds.array() as number[][];

    // Calculate R2 and RMSE
    let ssRes = 0;
    let ssTot = 0;
    let ysMean = 0;
    for (const y of ysArray) ysMean += y[0];
    ysMean /= ysArray.length;

    for (let i = 0; i < ysArray.length; i++) {
        const y = ysArray[i][0];
        const p = predsArray[i][0];
        ssRes += Math.pow(y - p, 2);
        ssTot += Math.pow(y - ysMean, 2);
    }

    const r2 = 1 - (ssRes / ssTot);
    const rmse = Math.sqrt(ssRes / ysArray.length);

    // Clean memory
    tf.dispose([xs, ys, xsMin, xsMax, xsRange, normXs, ysMin, ysMax, ysRange, normYs, predsNorm, preds]);
    model.dispose();

    return {
        r2,
        rmse,
        chartData: ysArray.map((actual, i) => ({ actual: actual[0], predicted: predsArray[i][0] })).slice(0, 100)
    };
}

export function runKMeans(data: any[], featureCols: string[], k: number) {
    const cleanData = data.filter(row => {
        for (const f of featureCols) {
            if (isNaN(Number(row[f]))) return false;
        }
        return true;
    });

    if (cleanData.length < k) throw new Error("Not enough valid data points for clustering.");

    const X = cleanData.map(row => featureCols.map(f => Number(row[f])));

    // Normalize X manually
    const min = Array(featureCols.length).fill(Infinity);
    const max = Array(featureCols.length).fill(-Infinity);
    for (const point of X) {
        for (let i = 0; i < point.length; i++) {
            if (point[i] < min[i]) min[i] = point[i];
            if (point[i] > max[i]) max[i] = point[i];
        }
    }

    const normX = X.map(point => point.map((val, i) => {
        const range = max[i] - min[i] || 1;
        return (val - min[i]) / range;
    }));

    // Random Init k centroids
    let centroids = [];
    for (let i = 0; i < k; i++) {
        centroids.push(normX[Math.floor(Math.random() * normX.length)]);
    }

    let assignments = new Array(normX.length).fill(0);
    let changed = true;
    let iterations = 0;

    const distance = (a: number[], b: number[]) => {
        let sum = 0;
        for (let i = 0; i < a.length; i++) sum += Math.pow(a[i] - b[i], 2);
        return Math.sqrt(sum);
    };

    while (changed && iterations < 100) {
        changed = false;
        const newAssignments = [];

        for (const point of normX) {
            let minD = Infinity;
            let cluster = 0;
            for (let i = 0; i < k; i++) {
                const d = distance(point, centroids[i]);
                if (d < minD) {
                    minD = d;
                    cluster = i;
                }
            }
            newAssignments.push(cluster);
        }

        for (let i = 0; i < normX.length; i++) {
            if (newAssignments[i] !== assignments[i]) {
                changed = true;
                break;
            }
        }
        assignments = newAssignments;

        // Recalculate centroids
        const newCentroids = Array(k).fill(0).map(() => Array(featureCols.length).fill(0));
        const counts = Array(k).fill(0);

        for (let i = 0; i < normX.length; i++) {
            const cluster = assignments[i];
            for (let j = 0; j < featureCols.length; j++) {
                newCentroids[cluster][j] += normX[i][j];
            }
            counts[cluster]++;
        }

        for (let i = 0; i < k; i++) {
            if (counts[i] === 0) {
                // Keep old centroid if empty
                newCentroids[i] = [...centroids[i]];
            } else {
                for (let j = 0; j < featureCols.length; j++) {
                    newCentroids[i][j] /= counts[i];
                }
            }
        }
        centroids = newCentroids;
        iterations++;
    }

    // Prepare 2D scatter using first two features or simple average for x/y
    const scatterData = X.map((point, i) => {
        return {
            x: point[0],
            y: featureCols.length > 1 ? point[1] : point[0],
            cluster: `Cluster ${assignments[i] + 1}`
        };
    }).slice(0, 500); // limit scatter points

    const clusterStats = Array.from({ length: k }, (_, i) => ({
        cluster: i + 1,
        count: assignments.filter(a => a === i).length
    }));

    return { scatterData, clusterStats, featureCols };
}

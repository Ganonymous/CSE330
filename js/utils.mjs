export function weightedRandomChoice(weightedArray, totalWeight){
    const randomTarget = Math.floor(Math.random() * totalWeight) + 1;
    let weightSum = 0;
    for(let [value, weight] of weightedArray){
        weightSum += weight;
        if(weightSum >= randomTarget) return value;
    }
}
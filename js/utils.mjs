export function weightedRandomChoice(weightedArray, totalWeight){
    const randomTarget = Math.floor(Math.random() * totalWeight) + 1;
    let weightSum = 0;
    for(let [value, weight] of weightedArray){
        weightSum += weight;
        if(weightSum >= randomTarget) return value;
    }
}

export function shuffleArray(array) {
    for (var i = array.length - 1; i >= 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
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

export function buildPool(pool){
    const cardsSect = document.createElement("section");
    cardsSect.classList.add("cards");
    pool.forEach(card => {
        const displayDiv = document.createElement("div");
        displayDiv.classList.add("card");
        displayDiv.classList.add(card.rarity);
        if(card.identifiers.multiverseId){
            const cardImg = document.createElement("img");
            cardImg.src = `https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${card.identifiers.multiverseId}&type=card`;
            cardImg.alt = `${card.name}, image from gatherer.wizards.com`;
            cardImg.height = "310";
            cardImg.width = "223";
            displayDiv.appendChild(cardImg);
        } else {
            const nameH3 = document.createElement("h3");
            nameH3.textContent = card.name;
            const costP = document.createElement("p");
            costP.textContent = card.manaCost;
            const typesH4 = document.createElement("h4");
            typesH4.textContent = card.type;
            const cardText = document.createElement("p");
            cardText.textContent = card.text;
            displayDiv.appendChild(nameH3);
            displayDiv.appendChild(costP);
            displayDiv.appendChild(typesH4);
            displayDiv.appendChild(cardText);
        }
        cardsSect.appendChild(displayDiv);
    })
    return cardsSect;
}

export function getLocalStorage(key) {
    const data = JSON.parse(localStorage.getItem(key));
    return data;
}
  
export function setLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

export function deletePool(pool) {
    let pools = getLocalStorage("almtgds-pools") || [];
    pools = pools.filter(next => next.uuid !== pool.uuid);
    setLocalStorage("almtgds-pools", pools);
}

export function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
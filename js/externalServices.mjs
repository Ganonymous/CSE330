const baseURL = "https://mtgjson.com/api/v5/";

async function convertToJson(res) {
    const jsonResponse = await res.json(); 
  
    if (res.ok) {
      return jsonResponse; 
    } else {
      throw { 
        name: 'servicesError', 
        message: jsonResponse 
      };
    }
  }

async function filterForBoosters(sets) {
    const withSealed = sets.filter((set) => set.sealedProduct);
    const withBooster = withSealed.filter((set) => set.sealedProduct.some((product) => product.category == "booster_pack"));
    return withBooster;
}

export default class ExternalServices {
    async getSets() {
        const results = await fetch(`${baseURL}SetList.json`);
        const data = await convertToJson(results);
        const allSets = data.data;
        console.log(allSets);
        const setsWithBoosters = await filterForBoosters(allSets);
        return setsWithBoosters;
    }

    async getSetData(code){
        const results = await fetch(`${baseURL}${code}.json`);
        const fullData = await convertToJson(results);
        const data = fullData.data;
        return data;
    }

    async getSecondaryCards(code){
        const result1 = await fetch("./json/secondarySets.json");
        const setsData = await convertToJson(result1);
        const secondarySets = setsData[code];
        if(secondarySets){
            let secondaryCards = [];
            for (let i = 0; i < secondarySets.length; i++) {
                const setResult = await fetch(`${baseURL}${secondarySets[i]}.json`);
                const setData = await convertToJson(setResult);
                const setCards = setData.data.cards;
                secondaryCards = secondaryCards.concat(setCards);
            }
            return secondaryCards;
        } else return [];
    }
}


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
        const results = await fetch("https://mtgjson.com/api/v5/SetList.json");
        const data = await convertToJson(results);
        const allSets = data.data;
        const setsWithBoosters = await filterForBoosters(allSets)
        return setsWithBoosters;
    }
}

// src/data/mealOptions.js

export const mealOptions = {
  protein: {
    category: "High Protein Plan",
    meals: {
      proteinSources: [
        { name: "Chicken Breast", protein: "31g", video: "/fooditems/chicken.mp4" },
        { name: "Fish Fillet", protein: "26g", video: "/fooditems/fish.mp4" },
        { name: "Mutton", protein: "25g", video: "/fooditems/mutton.mp4" },
        { name: "Omelet", protein: "11g", video: "/fooditems/omelet.mp4" },
        { name: "pork", protein: "38g", video: "/fooditems/pork.mp4" },
        { name: "Prawns", protein: "24g", video: "/fooditems/prawns.mp4" },
      ],
      carbs: [
        { name: "White Rice", carbs: "45g", video: "/fooditems/whiterice.mp4" },
        { name: "Brown Rice", carbs: "40g", video: "/fooditems/brownrice.mp4" },
        { name: "Sweet Potato", carbs: "35g", video: "/fooditems/sweetpotato.mp4" },
        { name: "Whole Wheat Bread", carbs: "44g", video: "/fooditems/bread.mp4" },
      ],
      veggies: [
        { name: "Broccoli", video: "/fooditems/brocoli.mp4" },
        { name: "Spinach", video: "/fooditems/spinach.mp4" },
        { name: "Zucchini", video: "/fooditems/zucchini.mp4" },
        { name: "carrots", video: "/fooditems/carrots.mp4" },
        { name: "Bell Peppers", video: "/fooditems/bellpepper.mp4" },
      ],
      salad: [
        { name: "Green Salad", video: "/fooditems/greensalad.mp4" },
        { name: "Fruit Salad", video: "/fooditems/fruitsalad.mp4" },
        { name: "Chicken Caesar Salad", video: "/fooditems/chickensalad.mp4" },
        { name: "Greek Salad", video: "/fooditems/greeksalad.mp4" },
      ],
    },
  },

  keto: {
    category: "Keto Plan",
    meals: {
      proteinSources: [
        { name: "Eggs", protein: "13g", video: "/fooditems/eggs.mp4" },
        { name: "Bacon", protein: "37g", video: "/fooditems/bacon.mp4" },
        { name: "Salmon", protein: "26g", video: "/fooditems/salmon.mp4" },
        { name: "Grilled Chicken legs", protein: "25g", video: "/fooditems/chickenlegs.mp4" },
      ],
      fats: [
        { name: "Avocado", fat: "15g", video: "/fooditems/avocodo.mp4" },
        { name: "Cheese", fat: "20g", video: "/fooditems/cheese.mp4" },
        { name: "Almonds", fat: "14g", video: "/fooditems/almonds.mp4" },
        { name: "Curd", fat: "12g", video: "/fooditems/curd.mp4" },
      ],
      veggies: [
        { name: "Zucchini Noodles", video: "/fooditems/noodles.mp4" },
        { name: "Veg Rice", video: "/fooditems/vegrice.mp4" },
        { name: "Mushroom Stir Fry", video: "/fooditems/mushroom.mp4" },
      ],
      snacks: [
        { name: "Panner kebab", video: "/fooditems/kebab.mp4" },
        { name: "Potato fries", video: "/fooditems/fries.mp4" },
      ],
    },
  },

  vegan: {
    category: "Vegan Plan",
    meals: {
      proteinSources: [
        { name: "Tofu Soup", protein: "10g", video: "/fooditems/tofusoup.mp4" },
        { name: "Lentils", protein: "9g", video: "/fooditems/lentils.mp4" },
        { name: "Chickpeas", protein: "19g", video: "/fooditems/beans.mp4" },
        { name: "Mushroom", protein: "20g", video: "/fooditems/mushroom.mp4" }, 
      ],
      carbs: [
        { name: "Quinoa", carbs: "39g", video: "/fooditems/quino.mp4" },
        { name: "Brown Rice", carbs: "42g", video: "/fooditems/brownrice.mp4" },
        { name: "Pasta", carbs: "40g", video: "/fooditems/pasta.mp4" },
      ],
      veggies: [
        { name: "Spinach", video: "/fooditems/spinach.mp4" },
        { name: "Broccoli", video: "/fooditems/brocoli.mp4" },
        { name: "Bell Peppers", video: "/fooditems/bellpepper.mp4" },
      ],
      snacks: [
        { name: "Dark Chocolate", video: "/fooditems/darkchocolate.mp4" },
        { name: "Vegan Smoothie ", video: "/fooditems/smoothie.mp4" },
      ],
    },
  },

  weightloss: {
    category: "Weight Loss Plan",
    meals: {
      proteinSources: [
        { name: "Grilled Chicken", protein: "30g", video: "/fooditems/chicken.mp4" },
        { name: "Paneer", protein: "18g", video: "/fooditems/kebab.mp4" },
        { name: "Boiled Eggs", protein: "13g", video: "/fooditems/eggs.mp4" },
        { name: "Tuna", protein: "25g", video: "/fooditems/fish.mp4" },
      ],
      carbs: [
        { name: "Oats", carbs: "27g", video: "/fooditems/oats.mp4" },
        { name: "Sweet Potato", carbs: "35g", video: "/fooditems/sweetpotato.mp4" },
        { name: "Brown Rice", carbs: "40g", video: "/fooditems/brownrice.mp4" },
      ],
      veggies: [
        { name: "Broccoli", video: "/fooditems/brocoli.mp4" },
        { name: "Cucumber", video: "/fooditems/cucumber.mp4" },
        { name: "Lettuce", video: "/fooditems/lettuce.mp4" },
        { name: "Zucchini", video: "/fooditems/zucchini.mp4" },
      ],
      snacks: [
        { name: "Greek Yogurt with Berries", video: "/fooditems/yogurt.mp4" },
        { name: "Roasted Corn", video: "/fooditems/roastedcorn.mp4" },
      ],
    },
  },
};
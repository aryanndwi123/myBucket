/**
 * Hard-coded content for the Recipes summary page (/recipes).
 * It is a presentation page, so none of this is computed from the user's saves.
 * Creators, handles, counts and titles are fictional.
 */

export interface TopRecipe {
  title: string;
  by: string;
  sub: string;
  blurb: string;
  likes: string;
  shares: string;
  time: string;
  tint: string;
}

export interface LikedRecipe {
  title: string;
  by: string;
  sub: string;
  blurb: string;
  /** True for the one recipe the user actually saved. */
  saved?: boolean;
}

export interface ShopItem {
  name: string;
  /** What it is for, in the user's own recipes. */
  forRecipe: string;
}

export interface SundayPick {
  slot: string;
  title: string;
  why: string;
  time: string;
}

export const RECIPES_SUMMARY = {
  saved: 1,
  tried: 0,
  liked: 3,
  oneLiner:
    "You've saved one recipe so far, a high-protein veg breakfast. Your likes lean towards quick, protein-heavy vegetarian food.",

  topShared: [
    {
      title: "Creamy one-pot masala pasta",
      by: "@kitchen.kaveri",
      sub: "Dinner",
      blurb: "Ten ingredients, one pan and a sauce that tastes like it took an hour.",
      likes: "184K",
      shares: "42K",
      time: "25 min",
      tint: "#F5C9A6",
    },
    {
      title: "Three-ingredient mango kulfi",
      by: "@sweetsprint",
      sub: "Desserts",
      blurb: "No ice-cream maker, no condensed milk. Freeze overnight and slice.",
      likes: "126K",
      shares: "38K",
      time: "10 min + freeze",
      tint: "#F1DF9E",
    },
    {
      title: "Crispy air-fryer paneer tikka",
      by: "@tadka.tom",
      sub: "Snacks",
      blurb: "Restaurant-style char without a tandoor. The marinade is the whole trick.",
      likes: "97K",
      shares: "29K",
      time: "20 min",
      tint: "#EBCFC6",
    },
  ] satisfies TopRecipe[],

  likedByYou: [
    {
      title: "5-minute high-protein paneer bhurji",
      by: "@chef.anaya",
      sub: "Breakfast",
      blurb: "About 30 g protein. Onion-tomato masala, besan for body, kasuri methi to finish.",
      saved: true,
    },
    {
      title: "Dal tadka, restaurant style",
      by: "@tadka.tom",
      sub: "Dinner",
      blurb: "Smoky tadka poured over creamy dal. Works with whatever lentils you have.",
    },
    {
      title: "Two-ingredient chocolate mousse",
      by: "@sweetsprint",
      sub: "Desserts",
      blurb: "Dark chocolate and cream. Sets in the fridge while you eat dinner.",
    },
  ] satisfies LikedRecipe[],

  utensils: [
    { name: "26 cm non-stick kadai", forRecipe: "Paneer bhurji" },
    { name: "Wide steel tawa", forRecipe: "Besan cheela" },
    { name: "Silicone spatula", forRecipe: "Paneer bhurji, chocolate mousse" },
    { name: "Measuring cups and spoons", forRecipe: "Chocolate mousse" },
  ] satisfies ShopItem[],

  ingredients: [
    { name: "Paneer, 400 g", forRecipe: "Paneer bhurji" },
    { name: "Kasuri methi", forRecipe: "Paneer bhurji" },
    { name: "Besan, 500 g", forRecipe: "Paneer bhurji" },
    { name: "Dark chocolate, 200 g", forRecipe: "Chocolate mousse" },
  ] satisfies ShopItem[],

  sunday: [
    {
      slot: "Breakfast",
      time: "9:30 AM",
      title: "5-minute paneer bhurji",
      why: "It's Sunday, let's cook this. You've had it saved all week and it takes five minutes.",
    },
    {
      slot: "Lunch",
      time: "1:00 PM",
      title: "Dal tadka, restaurant style",
      why: "A slow Sunday lunch. Pressure-cook the dal while you read, temper at the end.",
    },
    {
      slot: "Evening",
      time: "6:00 PM",
      title: "Two-ingredient chocolate mousse",
      why: "Make it before dinner so it sets. Nothing to bake, nothing to wash twice.",
    },
  ] satisfies SundayPick[],
};

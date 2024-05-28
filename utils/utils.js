const shortid = require("shortid");

const rules = [
  "something red",
  "something from your fridge",
  "something nerdy",
  "something from your childhood",
  "something from your wardrobe",
  "something blue",
  "something old",
  "something new",
  "something borrowed",
  "something edible",
  "something you love",
  "something you hate",
  "something you made",
  "something you bought",
  "something you found",
  "something small",
  "something big",
  "something heavy",
  "something light",
  "something shiny",
  "something rare",
  "something common",
  "something square",
  "something round",
  "something bright",
  "something dark",
  "something colorful",
  "something dull",
  "something expensive",
  "something cheap",
  "something broken",
  "something fixed",
  "something messy",
  "something clean",
  "something sharp",
  "something dull",
  "something tasty",
  "something noisy",
  "something quiet",
  "something cold",
  "something warm",
  "something wet",
  "something dry",
  "something fuzzy",
  "something smooth",
];

exports.generateID = () => {
  return shortid.generate();
};

exports.randomIndex = (length) => {
  return Math.floor(Math.random() * length);
};

exports.randomRule = () => {
  return rules[exports.randomIndex(rules.length)]
}
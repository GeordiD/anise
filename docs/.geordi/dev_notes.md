# Dev notes

Ingredient Project

Overall step/job thoughts

- Is this metadata concept too vague, or is that good?

TODO

- We could probably conditionally bypass the LLM parse step by:
  - Splitting the text after a number
  - Checking the db if there's an exact match for the text (+ account for pluralize)
  - "2 green onions" -> "2" + "green onions" -> "2" "green onion" -> ✅
- I don't feel good about the fuzzy matching. I think we need RAG
- Is any of this able to be done with a Haiku?
- Edge cases
  - We're defaulting to singular, but that doesn't work for plural things without a quantity (i.e. "buns")

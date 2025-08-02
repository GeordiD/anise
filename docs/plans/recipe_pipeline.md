# Recipe Pipeline

We need to be able to ingest recipes from a variety of sources (websites, pictures) and put them into our database in a consistent way so they can be viewed in our app.

## Goals

- Create a recipe ingest pipeline.
- At this point, we're mostly concerned about the backend for this. We can kick it off via a curl request
- Pipeline should be able to consume recipes from a url and from an image
- It processes the input, finding the following recipe elements:
  - Name
  - Time to cook / number of servings
  - Ingredients
  - Steps
- It parses these out to their individual elements and puts them in the database
- A QA step is involved to double check the work and make sure we're getting the recipe imported exactly.

## Context / Thoughts

- I'm expecting to use AI for some portions of this process. Since we have no idea what structure the content will be, it will be crucial in figuring out that stuff. It can also check it's own work after fact, and parse text from a picture, etc.
- I typically use OpenRouter for API requests.
- It's vital that we architect this in a clean and structured way. There's multiple ways recipes are entering this pipeline (text, pictures, web-fetching), but they all need to end up in the recipe database in a consistent way.

## Working Plan

- To start, we'll focus on grabbing recipes from a url. At some point we'll do photos, but for MVP we'll stick with urls
- Make an endpoint I can submit a url to in a POST request
- The endpoint will:
  - Fetch the url and store it in memory
  - Use an LLM to look at the file and pull out each element. This will probably be multiple calls so we can work in parallel and have targeted prompts
  - Use a second LLM to check the work for each element, look for mistakes, and correct.
  - Store the derived information in the database.

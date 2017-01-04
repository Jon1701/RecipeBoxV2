// Dependencies.
const rfr = require('rfr'); // Root-relative paths.

// Database models.
const Recipe = rfr('/server/models/Recipe');  // Recipe database model.

// Success/Error Response messages.
const MSG = (code) => {
  const messages = {
    MISSING_TITLE: 'Recipe title is required.',
    MISSING_TAGLINE: 'Recipe tagline is required.',
    MISSING_INGREDIENTS: 'Recipe ingredients are required.',
    MISSING_INSTRUCTIONS: 'Recipe preparation instructions are required.',
    MULTIPLE_INGREDIENTS_NEEDED: 'More than 1 ingredient is required.',
    MULTIPLE_PREPARATION_STEPS_NEEDED: 'More than 1 instruction step is required.',
    CREATE_RECIPE_SUCCESS: 'Recipe successfully created.',
    DB_ERROR: 'Unknown database error occurred.',
  };

  // Return message as an Object.
  return {
    code,
    message: messages[code],
  };
};

/*
 *
 *
 *  Route definition.
 *
 *
 */
const createRecipe = (req, res, next) => {
  // Get request body items.
  const username = req.decoded.username;  // String.
  const title = req.body.title;           // String.
  const tagline = req.body.tagline;       // String.
  let ingredients = req.body.ingredients;   // Array of Strings.
  let instructions = req.body.instructions; // Array of Strings.

  // Error check: title.
  if (!title || title.trim().length === 0) {
    return next(MSG('MISSING_TITLE'));
  }

  // Error check: tagline.
  if (!tagline || tagline.trim().length === 0) {
    return next(MSG('MISSING_TAGLINE'));
  }

  /*
   *  Helper function to iterate over an array, trim each item, and then only
   *  retain items which have non-zero length.
   */
  const filterOutEmptyStrings = arr => (
    arr.map(item => (item.trim())).filter(item => (item.length > 0))
  );

  // Error check: no ingredients.
  if (!ingredients) {
    return next(MSG('MISSING_INGREDIENTS'));
  }

  // Error check: no instructions.
  if (!instructions) {
    return next(MSG('MISSING_INSTRUCTIONS'));
  }

  // Error check: only one ingredient.
  if (typeof ingredients === 'string') {
    return next(MSG('MULTIPLE_INGREDIENTS_NEEDED'));
  }

  // Error check: only one instruction step.
  if (typeof instructions === 'string') {
    return next(MSG('MULTIPLE_PREPARATION_STEPS_NEEDED'));
  }

  // Filter out empty ingredients.
  ingredients = filterOutEmptyStrings(ingredients);

  // Filter out empty instructions.
  instructions = filterOutEmptyStrings(instructions);

  // Check if more than 1 ingredient is left over after filtering.
  if (ingredients.length < 2) {
    return next(MSG('MULTIPLE_INGREDIENTS_NEEDED'));
  }

  // Check if more than 1 instruction is left over after filtering.
  if (instructions.length < 2) {
    return next(MSG('MULTIPLE_PREPARATION_STEPS_NEEDED'));
  }

  // Create a new Recipe document using the Recipe model.
  const newRecipe = new Recipe({ username, title, tagline, ingredients, instructions });

  // Store the new Recipe in the recipes collection.
  newRecipe.save((err, result) => {
    // Database error check.
    if (err) (next(MSG('DB_ERROR')));

    // Response payload containing the recipe.
    const payload = { recipe: result };

    // Return success response.
    return res.json(Object.assign({},
      MSG('CREATE_RECIPE_SUCCESS'),
      { payload }));
  });

  // Return statement as required by esline.
  return true;
};

// Export route.
module.exports = createRecipe;

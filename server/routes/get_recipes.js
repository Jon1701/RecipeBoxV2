// Dependencies.
const rfr = require('rfr'); // Root-relative paths.
const isObjectIdValid = require('mongoose').Types.ObjectId.isValid;

// Configuration files.
const MSG = rfr('/server/messages/index');// Response error/success messages.

// Database models.
const Recipe = rfr('/server/models/Recipe');  // Recipe database model.

/*
 *
 *
 *  Route definition.
 *
 *
 */
const getRecipes = (req, res, next) => {
  /*
   *  Helper function to sanitize page number from the query string.
   *  Returns an integer number representation of the page number.
   *  If the page number is provided as a string, it just returns page number 1.
   */
  const sanitizePageNum = (pageNum) => {
    // If no page number was provided, return a 1.
    if (!pageNum) { return 1; }

    // Convert pageNum into an integer.
    const intPageNum = parseInt(pageNum, 10);

    // Check if intPageNum is an integer.
    if (isNaN(intPageNum)) { return 1; }

    // Return page number as an integer.
    return intPageNum;
  };

  // Extract request parameters
  const recipeID = req.query.recipe_id;
  const username = req.query.username;
  const pageNum = sanitizePageNum(req.query.pageNum);
  const perPage = 20;

  // Check for invalid page number.
  if (pageNum < 1) { return next(MSG.ERROR.VIEW_RECIPE.INVALID_PAGE_NUMBER); }

  // Check if object id is invalid
  if (recipeID && !isObjectIdValid(recipeID)) {
    return next(MSG.ERROR.VIEW_RECIPE.INVALID_RECIPE_ID);
  }

  // Blank search query.
  const searchQuery = {};

  // If recipeID is provided, add it to the search query.
  if (recipeID) { searchQuery['_id'] = recipeID; }

  // If username is provided, add it to the search query.
  if (username) { searchQuery.username = username; }

  // Pagination options.
  const paginationOptions = {
    skip: (pageNum - 1) * perPage,
    limit: perPage,
  };

  // Find all matching recipes.
  Recipe.find(searchQuery, null, paginationOptions, (errFind, resultsFind) => {
    // Database error handling.
    if (errFind) { return next(MSG.ERROR.DB.DB_ERROR); }

    // Response payload.
    const payload = {
      recipes: resultsFind, // List of recipes.
    };

    // Return success response payload.
    return res.send(Object.assign({}, MSG.SUCCESS.VIEW_RECIPE.RECIPE_SEARCH_COMPLETE, { payload }));
  });

  // Keep eslint happy.
  return true;
};

// Export route.
module.exports = getRecipes;
import * as model from "./model.js";
import { MODAL_CLOSE_SEC } from "./config.js";
import recipeView from "./views/recipeView.js";
import searchView from "./views/searchView.js";
import resultsView from "./views/resultsView.js";
import paginationView from "./views/paginationView.js";
import bookmarksView from "./views/bookmarksView.js";
import addRecipeView from "./views/addRecipeView.js";

import "core-js/stable"; //в терминале npm i core-js regenerator-runtime и появились эти расширения в package.json, это для работы приложения в старых браузерах (для создания полифилов для всего остального кроме async/await)
import "regenerator-runtime/runtime"; //для создания полифилов для async/await
import { async } from "regenerator-runtime";

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

// if (module.hot) {
//   module.hot.accept(); //фича из parcel, которая не дает пропасть загруженным результам при обновлении страницы
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1); //получаем айди (который после #) отдельного рецепта в виде #5ed6604591c37cdc054bc886, поэтому при помощи .slice(1) убираем первый символ

    if (!id) return;
    recipeView.renderSpinner();

    //0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    //1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    //2) Loading recipe
    await model.loadRecipe(id); //вызываем функцию, которую импортировали из model.js, await, тк это асинхронная операция и функция возвращает промис

    //3) Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    //resultsView.render(model.state.search.results);//выдает нам все результаты на странице
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};

const controlPagination = function (goToPage) {
  // 1) Render NEW results
  resultsView.render(model.getSearchResultsPage(goToPage)); //когда вызывается эта функция, getSearchResultsPage из model.js запускается с новым значением страницы (goToPage) и соответственно правильно расставляет числа на кнопках о пред и след страницах

  // 2) Render NEW initial pagination
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // 1) Update the recipe servings (in state)
  model.updateServings(newServings);

  // 2) Update the recipe view
  //recipeView.render(model.state.recipe); //при таком написании обновляется вся страница при увеличении числа блюд, а нужно обновить только значения количеста ингридиентов
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks);

    // Change ID in URL
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();

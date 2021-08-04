import { async } from "regenerator-runtime";
import { API_URL, RES_PER_PAGE, KEY } from "./config.js";
import { AJAX } from "./helpers.js";

export const state = {
  recipe: {},
  search: {
    query: "",
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data; //то же самое, что let recipe = data.data.recipe
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }), //классный способ, чтобы добавить свойство в объект, который будет существовать не во всех объектах. в нашем случае это свойство нужно только в созданном нами рецепте
  };
};

export const loadRecipe = async function (id) {
  //эта функция будет изменять наш объект state.recipe сверху

  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some((bookmark) => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
  } catch (err) {
    //Temp error handling
    console.error(`${err} 💥💥💥`);
    throw err; //перекидывем ошибку здесь, чтобы она словилась в controller.js
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);

    state.search.results = data.data.recipes.map((rec) => {
      //получим новый массив с объектами
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1; //при новом поиске рецепта, рецепты будут показываться с первой страницы. без этой сточки, они показываются на той стр, на которой остановились при поиске предыдущего рецепта
  } catch {
    console.error(`${err} 💥💥💥`);
    throw err; //перекидывем ошибку здесь, чтобы она словилась в controller.js
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.resultsPerPage; //0 //например, вотрая страница page = 2 будет показывать результаты с 10 по 19 (ровно 10 штук)
  const end = page * state.search.resultsPerPage; //9

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach((ing) => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings; // newQuantity = oldQuantity * newServings / oldServings
  });

  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  //функция сохранения закладок в local storage
  localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks)); //localStorage находится в консоли браузера в Application
};

export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true; //добавим новое свойство рецепту, чтобы отслеживать, добавлены ли они в закладки

  persistBookmarks();
};

export const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex((el) => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function () {
  //функция, которая показывает bookmarks при загрузке страницы
  const storage = localStorage.getItem("bookmarks");

  if (storage) state.bookmarks = JSON.parse(storage);
};
init();

const clearBookmarks = function () {
  localStorage.clear("bookmarks");
};
//clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(
        //создадим из нашего массива массивов с новым, созданным нами рецептом объект, который вычленит только ингредиенты
        (entry) => entry[0].startsWith("ingredient") && entry[1] !== ""
      )
      .map((ing) => {
        const ingArr = ing[1].split(",").map((el) => el.trim());
        //const ingArr = ing[1].replaceAll(" ", "").split(",");

        if (ingArr.length !== 3)
          throw new Error(
            "Wrong ingredient format! Please use the correct format."
          );

        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description }; //quantity: quantity ? +quantity : null - превращаем эту переменную в число, а если ее нет как таковой (т.е. ""), то присваиваем null
      });

    const recipe = {
      //создаем такой же массив с рецептом, который мы получаем при подгрузке с API, чтобы его отправить в API и он скомпилировался у нас в новый наш рецепт
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};

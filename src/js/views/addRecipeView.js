import View from "./View.js";
import icons from "url:../../img/icons.svg"; //импортируем иконки, чтобы использовались те, что скомпилировал parcel

class AddRecipeView extends View {
  _parentElement = document.querySelector(".upload");
  _message = "Recipe was successfully uploaded!";

  _window = document.querySelector(".add-recipe-window");
  _overlay = document.querySelector(".overlay");
  _btnOpen = document.querySelector(".nav__btn--add-recipe");
  _btnClose = document.querySelector(".btn--close-modal");

  constructor() {
    super();
    this._addHandlerShowWindow(); //вызываем функцию сразу при загрузке страницы, нет смысла ее передавать в controller.js
    this._addHandlerHideWindow();
  }

  toggleWindow() {
    //закидываем эти строчки в отдельную функцию, чтобы потом передать эту функцию в _addHandlerShowWindow() вместе с bind, иначе теряется this
    this._overlay.classList.toggle("hidden");
    this._window.classList.toggle("hidden");
  }

  _addHandlerShowWindow() {
    this._btnOpen.addEventListener("click", this.toggleWindow.bind(this));
  }

  _addHandlerHideWindow() {
    this._btnClose.addEventListener("click", this.toggleWindow.bind(this));
    this._overlay.addEventListener("click", this.toggleWindow.bind(this));
  }

  addHandlerUpload(handler) {
    this._parentElement.addEventListener("submit", function (e) {
      e.preventDefault();
      const dataArr = [...new FormData(this)]; //получим все поля со значениями в форме для создания своего рецепта в виде массива массивов
      const data = Object.fromEntries(dataArr); //превратим массив массивов в объект
      handler(data);
    });
  }

  _generateMarkup() {}
}

export default new AddRecipeView();

import icons from "url:../../img/icons.svg"; //импортируем иконки, чтобы использовались те, что скомпилировал parcel

export default class View {
  _data;

  /**
   * Render the received object to the DOM
   * @param {Object | Object[]} data The data to be rendered (e.g. recipe)
   * @param {boolean} [render=true] If false, create markup string instead of rendering to the DOM
   * @returns {undefined | string} A markup string is returned if render=false
   * @this {Object} View instance
   * @todo Finish implementation
   * @author Maria Ametina
   */

  render(data, render = true) {
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  update(data) {
    this._data = data;
    const newMarkup = this._generateMarkup(); //для изменения некоторых данных в нашем, н-р, рецепте, мы сгенирируем такой же маркап, который после сравним с новым, с измененными данными
    //но тк newMarkup - это пока строка с html кодом, нам нужно преобразить ее в DOM-элемент

    const newDom = document.createRange().createContextualFragment(newMarkup); //преобразовываем строка с html кодом newMarkup в DOM node object, то есть в виртуальный объект DOM
    const newElements = Array.from(newDom.querySelectorAll("*")); //выберем все элементы нашего виртуального DOM, чтобы дальше с ним работать
    //newElements появляется при нажатии на кнопки увеличения/уменьшения количества порций - это NodeList, который содержит всю новую зарендеренную страницу с новыми данными, что позволяет теперь сравнить данные с изначального рецепта
    const curElements = Array.from(this._parentElement.querySelectorAll("*")); //получим такой же NodeList с текущими данными, чтобы их сопоставить с новыми.
    //Array.from(), чтобы превратить NodeList-ы в массив

    newElements.forEach((newEl, i) => {
      const curEl = curElements[i]; //таким способом можно циклить 2 похожих массива одновременно
      //newEl.isEqualNode(curEl); //с помощью isEqualNode() сравниваем элементы, ответы будут true/false

      // Updates changed TEXT //в этом блоке мы изменили текстовый контент
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ""
      ) {
        //берем элементы, которые вернули false, и в них есть текстовый контент
        curEl.textContent = newEl.textContent; //заменяем старый контент на новый
      }

      // Updates changed ATTRIBUTES //меняем аттрибуты data-set на кнопках, чтобы увеличивать и уменьшать количество порций
      if (!newEl.isEqualNode(curEl)) {
        Array.from(newEl.attributes).forEach((attr) =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }

  _clear() {
    this._parentElement.innerHTML = ""; //убираем сначала все дефолтные надписи, чтобы вставить нужный блок с рецептом
  }

  renderSpinner() {
    const markup = `
        <div class="spinner">
          <svg>
            <use href="${icons}#icon-loader"></use>
          </svg>
        </div>
      `;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  renderError(message = this._errorMessage) {
    const markup = `
        <div class="error">
          <div>
              <svg>
              <use href="${icons}#icon-alert-triangle"></use>
              </svg>
          </div>
          <p>${message}</p>
      </div>
      `;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }

  renderMessage(message = this._message) {
    const markup = `
        <div class="message">
          <div>
              <svg>
              <use href="${icons}#icon-smile"></use>
              </svg>
          </div>
          <p>${message}</p>
      </div>
      `;
    this._clear();
    this._parentElement.insertAdjacentHTML("afterbegin", markup);
  }
}

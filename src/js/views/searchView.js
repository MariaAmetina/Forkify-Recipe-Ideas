class SearchView {
  _parentEl = document.querySelector(".search");

  getQuery() {
    const query = this._parentEl.querySelector(".search__field").value;
    this._clearInput();
    return query;
  }

  _clearInput() {
    this._parentEl.querySelector(".search__field").value = "";
  }

  addHandlerSearch(handler) {
    this._parentEl.addEventListener("submit", function (e) {
      e.preventDefault();

      if (window.screen.width <= 500) {
        document.querySelector(".search-results").classList.remove("hide");
        document.querySelector(".recipe").classList.add("hide");
      }

      handler();
    });
  }
}

export default new SearchView();

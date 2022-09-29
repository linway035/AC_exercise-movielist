// API的 URL 變化規則都很類似，因為大多參考了 RESTful 的風格，所以這邊我們拆分
const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
//可用下列console.log觀察了解response了甚麼
///shift + alt + a
/* axios
  .get(INDEX_URL) // 修改這裡
  .then((response) => {
    console.log(response);
    console.log(response.data);
    console.log(response.data.results);
  })
  .catch((err) => console.log(err)); */

// const 代表我們希望 movies 的內容維持不變。需要用 movies.push() 的方式把資料放進去
const dataPanel = document.querySelector("#data-panel");
const movies = JSON.parse(localStorage.getItem("favoriteMovies")) || [];

function renderMovieList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
      <div class="col-sm-2">
          <div class="mt-2 mb-2">
            <!-- 上面有設定大小排版了 style屬性就可以拿掉 -->
            <div class="card">
              <img
                src="${POSTER_URL + item.image}"
                class="card-img-top"
                alt="Movie Poster"
              />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <!-- 在card搜尋footer -->
              <div class="card-footer">
                <!-- 自行新增class:btn-show-movie方便之後DOM運作，用id的話只會設定到一個 -->
                <!-- 要記得加上modal來trigger -->
                <!-- data-bs-toggle 我們指定接下來要使用 modal 的形式，而 data-bs-target 則定義了互動的目標元件是哪個id  #movie-modal -->
                <button
                  type="button"
                  class="btn btn-primary btn-show-movie"
                  data-bs-toggle="modal"
                  data-bs-target="#movie-modal"
                  data-id="${item.id}"
                >
                  More
                </button>
                <button type="button" class="btn btn-danger btn-remove-favorite" data-id="${
                  item.id
                }">
                  x
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
  });
  dataPanel.innerHTML = rawHTML; //注意，必須在forEach外面，才能避免remove時沒有立即刪除
}

dataPanel.addEventListener("click", function onPanelClick(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(Number(event.target.dataset.id));
  }
});

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results;
      modalTitle.innerText = data.title;
      modalImage.innerHTML = `<img src="${
        POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`;
      modalDate.innerText = `Release Date: ${data.release_date}`;
      modalDescription.innerText = data.description;
    })
    .catch((err) => console.log(err));
}

function removeFromFavorite(id) {
  if (!movies || !movies.length) return;
  const movieIndex = movies.findIndex((movie) => movie.id === id); //把這movie {id:1,title:...}抓出來
  if (movieIndex === -1) return;
  movies.splice(movieIndex, 1);
  localStorage.setItem("favoriteMovies", JSON.stringify(movies)); //轉為JSON格式的字串，存入資料
  renderMovieList(movies);
}
//在此例favorite.js中，movies沒有資料會是空陣列，只用movies.length檢查就足夠，不過若是隨著功能增長，有其他的地方也在修改movies變數，若剛好沒有注意讓movies變數變成undefined或是null的話，只檢查movies.length而沒有先檢查movies存不存在，就會報錯，應該會是類似cannot read length of undefined這類的錯誤，這時候整個app就掛了，所以保險起見，在使用.length之前，最好還是先檢查object是不是存在哦！

//!movies || !movies.length因為一開始的 movies 為 [ ]，會取不到值為 null。因為 null 和 0 皆為 falsy value，在前面加上 ! 符號就會變為 not false = true，所以當 movies 為 null 或是 0 的時候，皆會直接終止函式。

//為保持嚴謹，避免之後發展更多內容時產生錯誤，所以對 傳入的 id 不存在於收藏清單 的情況，也納入return終止

renderMovieList(movies);

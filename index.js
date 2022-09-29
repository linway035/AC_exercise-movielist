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

const dataPanel = document.querySelector("#data-panel");

const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const searchResult = document.querySelector("#search-result");

const paginator = document.querySelector("#paginator");
const MOVIES_PER_PAGE = 12; //0-11, 12-23, 24-35...

const changePanel = document.querySelector("#mode-change");
const listBar = document.querySelector("#list-mode-button");
// 宣告currentPage去紀錄目前分頁，確保切換模式時分頁不會跑掉且搜尋時不會顯示錯誤
let currentPage = 1;

// const 代表我們希望 movies 的內容維持不變。需要用 movies.push() 的方式把資料放進去
const movies = [];
let filteredMovies = [];

//函式:顯示電影卡
function renderMovieList(data) {
  if (dataPanel.dataset.mode === "card-mode") {
    //注意: 這邊是三個等於，別再寫成一個了
    let rawHTML = "";
    data.forEach((item) => {
      rawHTML += `
      <div class="col-sm-3">
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
                <button type="button" class="btn btn-info btn-add-favorite" data-id="${
                  item.id
                }">
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    dataPanel.innerHTML = rawHTML; //注意，必須在forEach外面，才能避免remove時沒有立即刪除
  } else if (dataPanel.dataset.mode === "list-mode") {
    let rawHTML = `<ul class="list-group list-group-flush">`;
    data.forEach((item) => {
      rawHTML += `
        <li class="list-group-item ">
          <div class='row align-items-center'>
            <div class="col-11">
              <h5>${item.title}</h5>
            </div>
            <div class="col-1 d-flex justify-content-between">
              <button type="button" class=" btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="">More</button>
              <button type="button" class="ms-2 btn btn-info btn-add-favorite" data-id="">+</button>
            </div>
          </div>
        </li>`;
    });
    rawHTML += `</ul>`;
    dataPanel.innerHTML = rawHTML; //注意，必須在forEach外面，才能避免remove時沒有立即刪除
  } //else if失敗，原因尚未釐清，所以額外用function renderMovieListed代替
}

//事件:於電影卡的2個按鈕 顯示和喜愛
dataPanel.addEventListener("click", function onPanelClick(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

//函式:顯示modal資訊
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

//函式:加入喜愛
function addToFavorite(id) {
  const favoriteList = JSON.parse(localStorage.getItem("favoriteMovies")) || []; //將JSON格式的字串轉回為物件陣列，若沒GET到(null)則設為空陣列
  const movie = movies.find((movie) => movie.id === id); //把這movie {id:1,title:...}抓出來
  if (favoriteList.some((movie) => movie.id === id)) {
    //至少有一個存在，則回傳true
    return alert("此電影已經在收藏清單中！"); //若沒return的話，函式不會終止，會繼續後面的push，所以必須return
  }
  favoriteList.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(favoriteList)); //轉為JSON格式的字串，存入資料
}

//事件:於搜尋  顯示搜尋結果及警告
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  // let filteredMovies = []; 移去全域變數
  const keyword = searchInput.value.trim().toLowerCase();

  if (!keyword.length) {
    return alert("Please enter valid string!");
  }

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  //搜尋完，先顯示搜尋結果的第一頁
  currentPage = 1; //例如搜尋an，並點選第2頁。此時在搜尋欄位中再次搜尋an，則會維持在第2頁，而不會回到第一頁
  renderMovieList(getMoviesByPage(currentPage));
  renderPaginator(filteredMovies.length);
  renderSearchResult();
  searchInput.value = " "; //顯示完後清空搜尋欄
});

//函式:顯示各頁要取哪幾個資料資訊
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  //slice(含,不含)
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

//函式:顯示分頁數
function renderPaginator(amount) {
  const numberOfPage = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawPageHTML = `<li class="page-item active"><a class="page-link" href="#" data-page="1">1</a></li>`;
  for (let page = 2; page <= numberOfPage; page++) {
    rawPageHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawPageHTML;
}

//事件:於分頁器 顯示各分頁的搜尋結果
paginator.addEventListener("click", function onPaginatorClicked(event) {
  //如果被點擊的不是 <a> 標籤，結束。 tagName一律回傳大寫
  if (event.target.tagName !== "A") return;
  //它是字串，保險起見轉Number
  const page = Number(event.target.dataset.page);
  currentPage = page; //這句關鍵，不然怎麼按都只會在全域變數的let currentPage = 1;第一頁
  renderMovieList(getMoviesByPage(currentPage));
});

//事件:於分頁器 顯示當前在第幾頁 用active，刪除全部後才在event.target再加上
paginator.addEventListener("click", function onPageActive(event) {
  console.log(event.target.parentElement.parentElement.childNodes[1]);
  const pageButtonAmount =
    event.target.parentElement.parentElement.childNodes.length;
  console.log(pageButtonAmount);
  for (let i = 0; i < pageButtonAmount; i++) {
    event.target.parentElement.parentElement.childNodes[i].classList.remove(
      "active"
    );
  }
  event.target.parentElement.classList.add("active");
});

//函式: 依 data-mode 切換不同的顯示方式
function changeDisplayMode(displayMode) {
  if (dataPanel.dataset.mode === displayMode) return;
  dataPanel.dataset.mode = displayMode; //不同的話則更換html的data-mode
}

//事件: 於切換區 切換模式
changePanel.addEventListener("click", function onSwitchClicked(event) {
  if (event.target.matches("#card-mode-button")) {
    changeDisplayMode("card-mode");
    renderMovieList(getMoviesByPage(currentPage));
  } else if (event.target.matches("#list-mode-button")) {
    changeDisplayMode("list-mode");
    renderMovieList(getMoviesByPage(currentPage));
  }
});

//函式: 顯示搜尋結果 更改HTML
function renderSearchResult() {
  searchResult.innerHTML = "";
  if (searchInput.value.trim().length > 0) {
    searchResult.innerHTML = `<em>篩選關鍵字: [${searchInput.value}] 搜尋結果: [${filteredMovies.length}筆]</em>`;
  }
}

// send request to index api
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(currentPage));
    renderSearchResult();
  })
  .catch((err) => console.log(err));

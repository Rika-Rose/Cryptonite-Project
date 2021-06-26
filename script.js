//Generall-Functions----------------------------------------------------------------------|

//General-Ajax-Function----->
function getAjax(url) {
  return new Promise((resolve, reject) => {
    $.ajax({
      url: url,
      success: (data) => resolve(data),
      error: (err) => reject(err),
    });
  });
}

//Hiding-Function----------->
function hideElements() {
  $("#cardContainer").hide();
  $("#searchContainer").hide();
  $("#myAbout").remove();
  $("#chartContainer").remove();
}

//Home-Page-Functions---------------------------------------------------------------------|

//Ajax-Home-function------------------->
$(function () {
  $(document).ready(function () {
    $.ajax({
      url: "https://api.coingecko.com/api/v3/coins/list",
      // "https://api.coingecko.com/api/v3/coins",
      success: (coins) => homePage(coins),
      error: (err) => console.error(err.status),
    });
  });
});

//Home-page-function------------------->
$(function () {
  $("#homeBtn").on("click", function () {
    hideElements();
    $("#cardContainer").show();
  });
});

//Card-maker-function------------------>
let coinIdArr = [];
function homePage(coins) {
  $("#cardContainer").html("");
  for (coin of coins) {
    coinIdArr.push({ symbol: coin.symbol, name: coin.name });
    $("#cardContainer").append(`
    <div class="card text-center coinCard" style="width: 200px;" id="${coin.hashing_algorithm}">
      <div class="card-header">
      <h5 class="card-title">${coin.symbol}</h5>
      <div class="custom-control custom-switch">
      <input type="checkbox" name="${coin.symbol}" class="custom-control-input checkBox" onclick="checkBoxer(this)" name="${coin.id}" id="${coin.name}">
      <label class="custom-control-label" for="${coin.name}"></label>
      </div>
      </div>
      <div class="card-body">
      <p class="card-text">${coin.name}</p>
      <p>
      <button
      class="btn btn-outline-success moreInfoBtn"
      id="${coin.id}"
      onclick="collapseStorage(this)"
      type="button"
      data-toggle="collapse"
      data-target="#coll${coin.symbol}"
      aria-expanded="false"
      aria-controls="coll${coin.symbol}">
      More Info </button>
      <div class="collapse" id="coll${coin.symbol}">
      <img id="cardThrobber" src="Utilities/ringb.gif" />
      </div>
      </p>
      </div>
      </div>
      `);
  }
  $("#throbber").hide();
}

//Local-Storage-functions-------------->
function collapseStorage(moreBtn) {
  $("#throbber").show();
  let storedCoin = localStorage.getItem(`${moreBtn}`);
  if (storedCoin === null) {
    setStorage(moreBtn);
  } else {
    let twoMin = storageValidation(storedCoin);
    if (twoMin === true) {
      localStorage.removeItem(`${moreBtn}`);
      setStorage(moreBtn);
    } else {
      collapseFiller(storedCoin.info);
    }
  }
}

//Local-Storage-Validation-->
function storageValidation(storedCoin) {
  let currentTime = new Date().getTime();
  let timeDifference = currentTime - storedCoin.timeStamp;
  let lessZeroes = timeDifference / 60000;
  return lessZeroes > 2 ? true : false;
}

//Local-Storage-Set--------->
async function setStorage(coin) {
  let apiCoinArr = [];
  apiCoinArr = await getAjax(
    `https://api.coingecko.com/api/v3/coins/${coin.id}`
  );

  const newCoin = {
    symbol: apiCoinArr.symbol,
    usd: apiCoinArr.market_data.current_price.usd,
    eur: apiCoinArr.market_data.current_price.eur,
    ils: apiCoinArr.market_data.current_price.ils,
    img: apiCoinArr.image.thumb,
    timeStamp: new Date().getTime(),
  };
  collapseFiller(newCoin);
  localStorage.setItem(`${coin.id}`, newCoin);
}

//Collapse-Filler-Function-->
function collapseFiller(coin) {
  $(`#coll${coin.symbol}`).html(`
  USD: ${coin.usd}$ <br>
  EUR: ${coin.eur}€ <br>
  ILS: ${coin.ils}₪ <br>
  <div class="coinPic">
  <img src="${coin.img}">
  </div>
  `);
  $("#throbber").hide();
}

//Search-Page-Functions-------------------------------------------------------------------|
//On-Click-Function--------->
$(function () {
  $(".srcBtn").on("click", async function () {
    let id = "";
    const searchVal = $(".srcInp").val().toLowerCase();
    if (searchVal.length === 0) {
      alert("Please enter a Coin's id");
      return;
    }
    for (coin of coinIdArr) {
      if (coin.symbol === searchVal) {
        id = coin.name.toLowerCase();
      }
    }

    const api = await getAjax(`https://api.coingecko.com/api/v3/coins/${id}`);
    $(".srcInp").val("");
    try {
      searchCard(api);
    } catch {
      alert("Oops! no such coin. Please try again");
      return;
    }
  });
});

//Search-Card-Function------>
function searchCard(coin) {
  hideElements();
  $("#searchContainer").show();
  $("#searchContainer").html("");
  $("#searchContainer").append(`
  <div class="card text-center coinCard" style="width: 200px;" id="s${coin.hashing_algorithm}" >
    <div class="card-header">
      <h5 class="card-title">${coin.symbol}</h5>
      <div class="custom-control custom-switch">
        <input type="checkbox" name="${coin.symbol}" class="custom-control-input checkBox" 
          onclick="middleMan(this)" name="${coin.id}" id="s${coin.name}" >
        <label class="custom-control-label" for="s${coin.name}"></label>
      </div>
    </div>
    <div class="card-body">
      <p class="card-text">
        ${coin.name} <br>
        USD: ${coin.market_data.current_price.usd}$ <br>
        EUR: ${coin.market_data.current_price.eur}€ <br>
        ILS: ${coin.market_data.current_price.ils}₪ <br>
        <div class="coinPic">
          <img src="${coin.image.thumb}">
        </div>
      </p>
    </div>
  </div>
  `);
}
function middleMan(btn) {
  btn.id = btn.id.substring(1);
  checkBoxer(btn);
}

//Coin-Validation-And-Modal-Functions-----------------------------------------------------|

//Toggle-Function----------->
var checkBtnArr = [];
function checkBoxer(btn) {
  console.log(checkBtnArr);
  if ($(btn).is(":checked")) {
    if (checkBtnArr.length <= 4) {
      checkBtnArr.push(btn);
    } else if (checkBtnArr.length <= 5) {
      checkBtnArr.push(btn);
      $(btn).prop("checked", false);

      //Run Modal----------------->
      $(".modal-body").html("");
      for (coin of checkBtnArr) {
        $(".modal-body").append(`
        <div class="row justify-content-between mt-2 mb-2">
        <h5 class=".col-md-4 rmvItm">${coin.id}</h5>
        <div class="custom-control custom-switch rmvItm">
        <input type="checkbox" class="custom-control-input .col-md-4 .ml-auto modalCheckbox" onclick="removeCoinCheck(this)" id="${coin.name}">
        <label class="custom-control-label" for="${coin.name}"></label>
        </div>
        </div>
        <hr>
        `);
        $(".modalCheckbox").prop("checked", true);
        $("#myModal").modal({ backdrop: "static" });
        $("#modalCloseBtn").prop("disabled", true);
        $("#myModal").modal("show");
      }
    }
  } else {
    checkBtnArr.splice(checkBtnArr.indexOf(btn), 1);
  }
}

//Arr-Aiding-Function------->
let kickedCoins = [];
function removeCoinCheck(removeBtn) {
  if ($(removeBtn).is(":checked")) {
    for (kcoin of kickedCoins) {
      if (kcoin.name === removeBtn.id) {
        $(kcoin).prop("checked", true);
        checkBtnArr.push(kcoin);
        kickedCoins.splice(kickedCoins.indexOf(kcoin), 1);
      }
    }
  } else {
    for (arrCoin of checkBtnArr) {
      if (arrCoin.name === removeBtn.id) {
        $(arrCoin).prop("checked", false);
        kickedCoins.push(arrCoin);
        checkBtnArr.splice(checkBtnArr.indexOf(arrCoin), 1);
      }
    }
  }
  if (checkBtnArr.length <= 5) {
    $("#modalCloseBtn").prop("disabled", false);
  }
}

//Live-Reports-Page-Functions-------------------------------------------------------------|

//Validation-Function------->
$(function () {
  $("#liveBtn").on("click", function () {
    if (checkBtnArr.length === 0) {
      alert("Please choose at least one coin");
      return;
    }
    hideElements();
    $("main").append(`
    <div id="chartContainer" style="height: 80%; max-width: 85%; margin: 0px auto"></div>`);
    $("#chartContainer").show();

    //Coin-string-for-ajax-URL-->
    let coinString = "";
    for (coin of checkBtnArr) {
      coinString = coinString + coin.name + ",";
    }

    //Current-Currenc-Arr------->
    let currencyArr = [];
    async function currentPrice() {
      currencyArr = [];
      let api = await getAjax(
        `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${coinString}&tsyms=USD`
      );
      let data = [];
      data.push(api);
      for (let coin of data) {
        for (let p in coin) {
          currencyArr.push(coin[p].USD);
        }
      }
    }
    currentPrice();

    //Canvas-Options------------>
    var options = {
      zoomEnabled: true,
      title: { text: "Coin Comparison" },
      axisY: { prefix: "$" },
      toolTip: { shared: true },
      legend: {
        cursor: "pointer",
        verticalAlign: "top",
        fontSize: 22,
        fontColor: "dimGrey",
        itemclick: toggleDataSeries,
      },
      data: [],
    };
    var chart = new CanvasJS.Chart("chartContainer", options);

    //New-Coin-In-Canvas-------->
    for (coin of checkBtnArr) {
      options.data.push({
        type: "line",
        xValueType: "dateTime",
        yValueFormatString: "$####.00",
        xValueFormatString: "hh:mm:ss",
        showInLegend: true,
        name: coin.id,
        dataPoints: [],
      });
    }

    //Hide-Coin-Function-------->
    function toggleDataSeries(e) {
      if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
        e.dataSeries.visible = false;
      } else {
        e.dataSeries.visible = true;
      }
      chart.render();
    }
    //Update-Canvas------------->
    $("#throbber").show();
    async function updateChart() {
      await currentPrice();
      for (let i = 0; i < checkBtnArr.length; i++) {
        let coin = options.data[i].dataPoints;
        let currentTime = new Date().getTime();
        coin.push({
          y: currencyArr[i],
          x: currentTime,
        });
      }
      $("#throbber").hide();
      chart.render();
    }

    //Interval------------------>
    chart.render();
    updateChart();
    const chartInterval = setInterval(function () {
      updateChart();
    }, 2000);
  });
});

$(function () {
  if ($("#chartContainer").hide() === true) {
    clearInterval(chartInterval);
  }
});

//About-Page-Functions--------------------------------------------------------------------|
$(function () {
  $("#aboutBtn").on("click", function () {
    hideElements();
    $("#throbber").show();
    $("#myAbout").show();
    $("main").append(`
      <div id="myAbout">
      <p id="mobileAbout" class="d-md-none">
        <br><br>
        Hello.<br />
        I'm Rika-Rose Bar, a 28 year old goof ball,<br />
        and mother of two(cats).<br /><br />
      
        Having studing most my life<br />
        (actor/musician ex-stewardess <br />
        pastery-chef, with a diploma in <br />
        Spanish and a background in <br />
        teaching first aid classes, <br />
        in the house. Hella!)<br />
        I discovered programming by accident,<br />
        and fell madly in-love.<br /><br />
  
        I'm currently a John-Bryce student,<br />
        studying full stack web development.<br /><br />
        
        I'm a fierce over-achiver,<br />
        with slight OCD symptoms and <br />
        a kick for design.
      </p>
        
      <img src="Utilities/a3.png" id="a3" class="mePics d-none d-md-block"/>
      <img src="Utilities/a2.png" id="a2" class="mePics d-none d-md-block" />    
      <img src="Utilities/a1.png" id="a1" class="mePics d-none d-md-block" />
      <img src="Utilities/a4.png" id="a4" class="mePics d-none d-md-block" />
      <img src="Utilities/a5.png" id="a5" class="mePics d-none d-md-block" />
      </div>
    `);
    $("#throbber").hide();
  });
});

const appid = 'e90a3f04c0708fb60b086c7d69875752';
const appUrlWeather = 'https://api.openweathermap.org/data/2.5/weather?q=';
const appUrlForecast = 'https://api.openweathermap.org/data/2.5/forecast?q=';
var weatherFormEl = $('#weather-form');
var searchbtn = $('seach_weather')
var cityInputEl = $('#city_value');
var weatherReport = $('.weather-report');
var resultContainerEl = $('.result-section');
var forcastDiv = $('.forecast-section ul');
var alert = $('.alert');
var listArray;


weatherFormEl.on('submit', function(e){
  e.preventDefault();
  var cityName = cityInputEl.val();
  if(cityName.length == 0){
    alert.html('Please enter a valid City Name. <strong>City</strong> cannot be blank.').fadeTo(2000, 500).fadeOut(500);
  } else {
    console.log(cityName);
    console.log("HOw");
    weatherMain(cityName);
    weatherForecast(cityName);
  }
});

function weatherMain(cityName) {
  var apiUrl =  appUrlWeather + cityName + '&mode=json&units=metric&appid=' + appid;
  $.get(apiUrl).then(function(response){
    console.log(response.response);
      var currTime = new Date(response.dt*1000);
      var weatherIcon = 'https://openweathermap.org/img/wn/' + response.weather[0].icon + '@2x.png';
      
      resultContainerEl.html(
      '<h2>' +  response.name + '(' + currTime.getDate() + '/' + (currTime.getMonth()+1) + '/' + currTime.getFullYear() + ') <img src=' + weatherIcon + ' height="70px"></h2>' +
      '<p>Temperature: ' + response.main.temp + '°C </p>' +
      '<p>Wind: ' + response.wind.speed + 'mph</p>' +
      '<p>Humidity: ' + response.main.humidity + '% </p>',
      uvIndex(response.coord));

      createHistoryButton(response.name);

  })
  .fail(function(){
        alert.html('Please enter a valid City Name. <strong>' + cityName + '</strong> is not a valid city Name.').fadeTo(2000, 500).fadeOut(500);
  });
  
}



function weatherForecast(cityName) {
    var url = appUrlForecast + cityName + '&mode=json&units=metric&appid=' + appid;
    console.log(url);

    $.get(url).then(function(response){
        var forecastInfo = response.list;
        forcastDiv.empty();
        $.each(forecastInfo, function(i) {
            if (!forecastInfo[i].dt_txt.includes("12:00:00")) {
                return;
            }
            var fDate = new Date(forecastInfo[i].dt*1000);
            var weatherIcon = 'https://openweathermap.org/img/wn/' + forecastInfo[i].weather[0].icon + '@2x.png';
            forcastDiv.append(
                    '<li class="forecast-single">' +
                        '<h3>' + fDate.getDate() + '/' + (fDate.getMonth()+1) + '/' + fDate.getFullYear() + '</h3>' +
                        '<img src=' + weatherIcon + ' alt="Icon" />' +
                        '<div class="forecast-details">' +
                        '<p>Temp: ' + forecastInfo[i].main.temp + '°C </p>' +
                        '<p>Wind: ' + forecastInfo[i].wind.speed + 'mph</p>' +
                        '<p>Humidity: ' + forecastInfo[i].main.humidity + '%</p>' +
                        '</div>' +
                    '</li>'
            );
        });
    });
}

function uvIndex(coord) {
   var url = 'https://api.openweathermap.org/data/2.5/uvi?lat=' + coord.lat + '&lon=' + coord.lon + '&appid=' + appid;
  console.log(url);

  $.get(url).then(function(response){
      var uvInd = response.value;
      var bgcolor = "green";

      if (uvInd >= 11) {
          bgcolor = "pink";
      } else if (uvInd >= 8) {
          bgcolor = "red";
      } else if (uvInd >= 6) {
          bgcolor = "orange";
      } else if (uvInd >= 3) {
        bgcolor = "darkgoldenrod";
    } else if (uvInd >= 1) {
        bgcolor = "green";
    }
      resultContainerEl.append('<p>UV Index: <span style="background-color: ' + bgcolor + '">' + uvInd + '</span></p>');
  });
}

if (localStorage.getItem("localWeatherSearches")) {
    listArray = JSON.parse(localStorage.getItem("localWeatherSearches"));
    writeSearchHistory(listArray);
} else {
    listArray = [];
}

function createHistoryButton(cityName) {
    var citySearch = cityName.trim();
    var buttonCheck = $('#lastSearch > BUTTON[value=' + citySearch + ']');
    if (buttonCheck.length == 1) {
      return;
    }
    
    if (!listArray.includes(cityName)){
        listArray.push(cityName);
        localStorage.setItem("localWeatherSearches", JSON.stringify(listArray));
    }

    $("#lastSearch").prepend(
    '<button class="btn btn-light cityBtn" value=' + cityName + '>' + cityName + '</button>'
    );
}


function writeSearchHistory(array) {
  $.each(array, function(i) {
      createHistoryButton(array[i]);
      if (i >= 9 ) {
          return false;
        }
  });
}

$("#lastSearch").click(function(e) {
    var cityName = e.target.value;
    weatherMain(cityName);
    weatherForecast(cityName);
  });
import { GoogleGenerativeAI } from "@google/generative-ai";

const OPENWEATHER_API_KEY = '8d47a5f053cdd7ebfc448b25abd8144e';

const Gemini_API_KEY = "AIzaSyCENg5agjTY6AU1_nXWF5JUEvM7wQXJ-I4";
const genAI = new GoogleGenerativeAI(Gemini_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let TableList = [];

let currentPage = 1;
const entriesPerPage = 5;

const extractTableInfo = (data) => {

    TableList.length = 0;

    data.list.map((item) => {
        const time = item.dt_txt;
        const temperature = item.main.temp;
        const feelsLike = item.main.feels_like;
        const weatherDescription = item.weather[0].description;

        TableList.push({
            time,
            temperature,
            feelsLike,
            weatherDescription
        })
    })
}

const setTable = () => {

    $("#tbodyContainer").empty();

    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;

    const paginatedEntries = TableList.slice(startIndex, endIndex);

    paginatedEntries.forEach((entry) => {
        const tableRows = `
            <tr>
                <td>${entry.time}</td>
                <td>${entry.temperature} °C</td>
                <td>${entry.feelsLike} °C</td>
                <td>${entry.weatherDescription}</td>
            </tr>
        `;

        $("#tbodyContainer").append(tableRows);
    })
}

const changePage = (page) => {
    currentPage = page;
    setTable();
    $("#pageIndex").html(`<p>${currentPage}</p>`);
}

const getDataFromStorage = () => {
    const dataString = localStorage.getItem("weatherData");

    if (!dataString) {
        return;
    }

    const data = JSON.parse(dataString);

    return data;
}

const resetTable = (callback) => {

    currentPage = 1;

    const data = getDataFromStorage();
    extractTableInfo(data);
    callback();
    setTable();
}

$("#next-btn").on("click", () => {
    if (currentPage * entriesPerPage < TableList.length) {
        changePage(currentPage + 1);
    }
})

$("#prev-btn").on("click", () => {
    if (currentPage > 1) {
        changePage(currentPage - 1);
    }
})

//this is what it will do in default anyway
$("#show-all-btn").on("click", () => {
    resetTable(() => {});
})

$("#asc-sort-btn").on("click", () => {
    resetTable(() => {
        TableList.sort((a, b) => {
            return a.temperature - b.temperature;
        });
    });
})

$("#desc-sort-btn").on("click", () => {
    resetTable(() => {
        TableList.sort((a, b) => {
            return b.temperature - a.temperature;
        });
    });
})

$("#without-rain-btn").on("click", () => {
    resetTable(() => {
        TableList = TableList.filter(
            (a) => !a.weatherDescription.toLowerCase().includes("rain")
        );
    });
})

$(() => {

    const data = getDataFromStorage();
    extractTableInfo(data);
    setTable();
    $("#pageIndex").text(currentPage);
});

$("#chatForm").on("submit", async (event) => {
    event.preventDefault();

    const chatInput = $("#chatInput");

    const question = chatInput.val();

    const prompt = `
        Limit your answer to 20 words max.

        Consider the following data
        ${JSON.stringify(TableList)}

        From this data given above answer the following question.

        ${question}
    `;

    const result = await model.generateContent(prompt);

    console.log(result.response.text());

    $("#chatContainer").append(`
        <div class="p-1 border border-gray-300 rounded-md single-msg">
            <p>${result.response.text()}</p>
        </div> 
    `);

    $("#chatContainer").scrollTop($("#chatContainer")[0].scrollHeight);

    chatInput.val("");
})

const setDataToLocal = (data, dataName) => {
    console.log("From the local: ", data);
    localStorage.setItem(dataName, JSON.stringify(data));
}

const setCurrentWeather = (data) => {
    console.log(data);
    
    const weatherCondition = data.weather[0].main.toLowerCase();

    $("#locationWeatherContainer").html(`
        <h2>${data.name}, ${data.sys.country}</h2>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">
        <p class="temperature">${data.main.temp.toFixed(1)}°C</p>
        <p class="description">${data.weather[0].description}</p>
        <p>Feels like: ${data.main.feels_like.toFixed(1)}°C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind: ${data.wind.speed.toFixed(1)} m/s</p>
    `);
}

$("#locationForm").on("submit", (event) => {
    event.preventDefault();

    const city = $("#location").val();
    const url_current_weather = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const url_forcast = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    $.ajax({
        url: url_current_weather,
        method: "GET",
        success: (data) => {
            setCurrentWeather(data);
            setDataToLocal(data, "locationData");
        },
        error: function(xhr, status, error) {
            alert(error);
        }
    })

    $.ajax({
        url: url_forcast,
        method: "GET",
    })
    .then((data) => {
        setDataToLocal(data, "weatherData");
        resetTable(() => {});
    })
    .catch(function(xhr, status, error) {
        alert(error);
    })
})
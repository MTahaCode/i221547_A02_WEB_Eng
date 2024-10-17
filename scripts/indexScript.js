const OPENWEATHER_API_KEY = '8d47a5f053cdd7ebfc448b25abd8144e';

let barChartInstance = null;
let doughnutChartInstance = null;
let lineChartInstance = null;

const setCurrentWeather = (data) => {
    console.log(data);
    
    const weatherCondition = data.weather[0].main.toLowerCase();

    console.log("Weather Condition: ", weatherCondition);

    $("#locationWeatherContainer").css({
        "background-image": `linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.5)), url('images/${weatherCondition}.jpg')`,
        "background-size": "cover",
        "background-position": "center",
        "backdrop-filter": "blur(50%)",
    })

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

const setBarChart = (data) => {

    if (barChartInstance) {
        barChartInstance.destroy();
    }

    const barChartContainer = $("#barChartContainer")[0].getContext("2d");

    //getting the label and temperatures for each day
    const temperatures = data.list.filter((item, index) => index % 8 === 0).map(item => item.main.temp);
    const labels = data.list.filter((item, index) => index % 8 === 0).map(item => new Date(item.dt * 1000).toLocaleDateString());

    barChartInstance = new Chart(barChartContainer, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Forcast for 5 Days",
                data: temperatures,
                borderWidth: 4,
            }],
        },
        options: {
            responsive: true,
            aspectRatio: 1.5,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Days",
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Temperatures",
                    }
                }
            }
        }
    })
}

const setDoughnutChart = (data) => {
    
    console.log(data);

    if (doughnutChartInstance) {
        doughnutChartInstance.destroy();
    }

    const doughnutChartContainer = $("#doughnutChartContainer")[0].getContext("2d");

    const conditions = data.list.map(item => item.weather[0].main);
    
    const conditionCounts = conditions.reduce((map, condition) => {
        if (map[condition]) {
            map[condition] += 1;
        }
        else {
            map[condition] = 1;
        }
        return map;
    }, {})

    doughnutChartInstance = new Chart(doughnutChartContainer, {
        type: "doughnut",
        data: {
            labels: Object.keys(conditionCounts),
            datasets: [{
                label: "Forcast for Each Week",
                data: Object.values(conditionCounts),
                borderWidth: 4,
            }],
        },
        options: {
            responsive: true,
            aspectRatio: 1.5,
        }
    })
}

const setLineChart = (data) => {

    if (lineChartInstance) {
        lineChartInstance.destroy();
    }

    const lineChartContainer = $("#lineChartContainer")[0].getContext("2d");

    //getting the label and temperatures for each day
    const temperatures = data.list.filter((item, index) => index % 8 === 0).map(item => item.main.temp);
    const labels = data.list.filter((item, index) => index % 8 === 0).map(item => new Date(item.dt * 1000).toLocaleDateString());

    lineChartInstance = new Chart(lineChartContainer, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Forcast for 5 Days",
                data: temperatures,
                borderWidth: 4,
            }],
        },
        options: {
            responsive: true,
            aspectRatio: 1.5,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Days",
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Temperatures",
                    }
                }
            },
            animations: {
                y: {
                    easing: 'easeInOutElastic',
                    from: (ctx) => {
                            if (ctx.type === 'data') {
                            if (ctx.mode === 'default' && !ctx.dropped) {
                                ctx.dropped = true;
                                return 0;
                            }
                        }
                    }
                }
            },
        }
    })
}

const setCharts = (data) => {
    setBarChart(data);
    setDoughnutChart(data);
    setLineChart(data);
}

const setDataToLocal = (data, dataName) => {
    console.log("From the local: ", data);
    localStorage.setItem(dataName, JSON.stringify(data));
}

$("#locationForm").on("submit", (event) => {
    event.preventDefault();
    
    // if (localStorage.getItem("weatherData")) {
    //     localStorage.removeItem("weatherData");
    // }

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
        setCharts(data);
        setDataToLocal(data, "weatherData");
    })
    .catch(function(xhr, status, error) {
        alert(error);
    })

})

$(() => {
    
    const weatherDataString = localStorage.getItem("weatherData");
    const locationDataString = localStorage.getItem("locationData");

    // console.log(weatherDataString);
    // console.log(locationDataString);

    if (weatherDataString) {
        const weatherData = JSON.parse(weatherDataString);
        setCharts(weatherData);
    }

    if (locationDataString) {
        const locationData = JSON.parse(locationDataString);
        setCurrentWeather(locationData);
    }

})
const OPENWEATHER_API_KEY = '8d47a5f053cdd7ebfc448b25abd8144e';

let barChartInstance = null;
let doughnutChartInstance = null;
let lineChartInstance = null;

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
            }
        }
    })
}

const setCharts = (data) => {
    setBarChart(data);
    setDoughnutChart(data);
    setLineChart(data);
}

const setDataToLocal = (data) => {
    console.log("From the local: ", data);
    localStorage.setItem("weatherData", JSON.stringify(data));
}

$("#locationForm").on("submit", (event) => {
    event.preventDefault();
    
    if (localStorage.getItem("weatherData")) {
        localStorage.removeItem("weatherData");
    }

    const city = $("#location").val();
    const url_current_weather = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const url_forcast = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    $.ajax({
        url: url_current_weather,
        method: "GET",
        success: setCurrentWeather,
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
        setDataToLocal(data);
    })
    .catch(function(xhr, status, error) {
        alert(error);
    })

})

$(() => {
    // if (localStorage.getItem("weatherData")) {
    //     localStorage.removeItem("weatherData");
    // }
})

// $(() => {
//     const barChartContainer = $("#barChartContainer")[0].getContext("2d");

//     new Chart(barChartContainer, {
//         type: "bar",
//         data: {
//             labels: [1,2,3,4, 6 , 234],
//             datasets: [{
//                 label: "The data",
//                 data: [5,6,70],
//                 backgroundColor: [
//                     'rgba(255, 99, 132, 0.4)',
//                     'rgba(255, 159, 64, 0.4)',
//                     'rgba(255, 205, 86, 0.4)',
//                 ],
//                 borderColor: [
//                     'rgb(255, 99, 132)',
//                     'rgb(255, 159, 64)',
//                     'rgb(255, 205, 86)',
//                 ],
//                 borderWidth: 4,
//                 options: {
//                     responsive: true,
//                     scales: {
//                         y: {
//                             beginAtZero: true
//                         }
//                     }
//                 }
//             }],
//         }
//     })
// })

// Replace with your actual API keys
// const OPENWEATHER_API_KEY = '8d47a5f053cdd7ebfc448b25abd8144e';
// const GEMINI_API_KEY = 'AIzaSyAJNTfBPE7m2PTJE3B8YOZHx05-5ca_vFg';

// const cityInput = document.getElementById('cityInput');
// const searchBtn = document.getElementById('searchBtn');
// const weatherWidget = document.getElementById('weatherWidget');
// const forecastTable = document.getElementById('forecastTable').getElementsByTagName('tbody')[0];
// const pagination = document.getElementById('pagination');
// const userInput = document.getElementById('userInput');
// const sendBtn = document.getElementById('sendBtn');
// const chatbox = document.getElementById('chatbox');

// let currentPage = 1;
// const entriesPerPage = 10;

// searchBtn.addEventListener('click', getWeather);
// sendBtn.addEventListener('click', sendMessage);

// async function getWeather() {
//     const city = cityInput.value;
//     if (!city) return;

//     try {
//         const currentWeather = await fetchCurrentWeather(city);
//         const forecast = await fetchForecast(city);
        
//         displayCurrentWeather(currentWeather);
//         displayForecast(forecast);
//         createCharts(forecast);
//     } catch (error) {
//         console.error('Error:', error);
//         weatherWidget.innerHTML = '<p>Error fetching weather data. Please try again.</p>';
//     }
// }

// async function fetchCurrentWeather(city) {
//     const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`);
//     if (!response.ok) throw new Error('City not found');
//     return response.json();
// }

// async function fetchForecast(city) {
//     const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`);
//     if (!response.ok) throw new Error('Forecast data not available');
//     return response.json();
// }

// function displayCurrentWeather(data) {
//     const weatherCondition = data.weather[0].main.toLowerCase();
//     weatherWidget.style.backgroundImage = `url('images/${weatherCondition}.jpg')`;
    
//     weatherWidget.innerHTML = `
//         <h2>${data.name}, ${data.sys.country}</h2>
//         <p>Temperature: ${data.main.temp}°C</p>
//         <p>Humidity: ${data.main.humidity}%</p>
//         <p>Wind Speed: ${data.wind.speed} m/s</p>
//         <p>Weather: ${data.weather[0].description}</p>
//         <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Weather icon">
//     `;
// }

// function displayForecast(data) {
//     forecastTable.innerHTML = '';
//     data.list.forEach((item, index) => {
//         if (index % 8 === 0) {  // Display data for every 24 hours
//             const row = forecastTable.insertRow();
//             row.innerHTML = `
//                 <td>${new Date(item.dt * 1000).toLocaleDateString()}</td>
//                 <td>${item.main.temp}°C</td>
//                 <td>${item.weather[0].description}</td>
//             `;
//         }
//     });
//     showPage(1);
// }

// function showPage(page) {
//     const rows = forecastTable.rows;
//     const pageCount = Math.ceil(rows.length / entriesPerPage);
    
//     for (let i = 0; i < rows.length; i++) {
//         if (i < (page - 1) * entriesPerPage || i >= page * entriesPerPage) {
//             rows[i].style.display = 'none';
//         } else {
//             rows[i].style.display = '';
//         }
//     }
    
//     updatePagination(page, pageCount);
// }

// function updatePagination(currentPage, pageCount) {
//     let paginationHTML = '';
//     for (let i = 1; i <= pageCount; i++) {
//         paginationHTML += `<button onclick="showPage(${i})" ${i === currentPage ? 'disabled' : ''}>${i}</button>`;
//     }
//     pagination.innerHTML = paginationHTML;
// }

// function createCharts(data) {
//     createTemperatureBarChart(data);
//     createWeatherConditionsDoughnutChart(data);
//     createTemperatureLineChart(data);
// }

// function createTemperatureBarChart(data) {
//     const ctx = document.getElementById('temperatureChart').getContext('2d');
//     const temperatures = data.list.filter((item, index) => index % 8 === 0).map(item => item.main.temp);
//     const labels = data.list.filter((item, index) => index % 8 === 0).map(item => new Date(item.dt * 1000).toLocaleDateString());
    
//     new Chart(ctx, {
//         type: 'bar',
//         data: {
//             labels: labels,
//             datasets: [{
//                 label: 'Temperature (°C)',
//                 data: temperatures,
//                 backgroundColor: 'rgba(75, 192, 192, 0.6)'
//             }]
//         },
//         options: {
//             responsive: true,
//             animation: {
//                 delay: (context) => context.dataIndex * 100
//             }
//         }
//     });
// }

// function createWeatherConditionsDoughnutChart(data) {
//     const ctx = document.getElementById('conditionsChart').getContext('2d');
//     const conditions = data.list.map(item => item.weather[0].main);
//     const conditionCounts = conditions.reduce((acc, condition) => {
//         acc[condition] = (acc[condition] || 0) + 1;
//         return acc;
//     }, {});
    
//     new Chart(ctx, {
//         type: 'doughnut',
//         data: {
//             labels: Object.keys(conditionCounts),
//             datasets: [{
//                 data: Object.values(conditionCounts),
//                 backgroundColor: [
//                     'rgba(255, 99, 132, 0.6)',
//                     'rgba(54, 162, 235, 0.6)',
//                     'rgba(255, 206, 86, 0.6)',
//                     'rgba(75, 192, 192, 0.6)',
//                     'rgba(153, 102, 255, 0.6)'
//                 ]
//             }]
//         },
//         options: {
//             responsive: true,
//             animation: {
//                 delay: (context) => context.dataIndex * 100
//             }
//         }
//     });
// }

// function createTemperatureLineChart(data) {
//     const ctx = document.getElementById('temperatureLineChart').getContext('2d');
//     const temperatures = data.list.map(item => item.main.temp);
//     const labels = data.list.map(item => new Date(item.dt * 1000).toLocaleTimeString());
    
//     new Chart(ctx, {
//         type: 'line',
//         data: {
//             labels: labels,
//             datasets: [{
//                 label: 'Temperature (°C)',
//                 data: temperatures,
//                 borderColor: 'rgba(75, 192, 192, 1)',
//                 tension: 0.1
//             }]
//         },
//         options: {
//             responsive: true,
//             animation: {
//                 y: {
//                     duration: 2000,
//                     from: 500
//                 }
//             },
//             scales: {
//                 x: {
//                     ticks: {
//                         maxTicksLimit: 8
//                     }
//                 }
//             }
//         }
//     });
// }

// async function sendMessage() {
//     const message = userInput.value;
//     if (!message) return;

//     chatbox.innerHTML += `<p><strong>You:</strong> ${message}</p>`;
//     userInput.value = '';

//     if (message.toLowerCase().includes('weather')) {
//         // Handle weather-related queries using OpenWeather API
//         try {
//             const weatherData = await fetchCurrentWeather(extractCityFromMessage(message));
//             const response = generateWeatherResponse(weatherData);
//             chatbox.innerHTML += `<p><strong>Bot:</strong> ${response}</p>`;
//         } catch (error) {
//             chatbox.innerHTML += `<p><strong>Bot:</strong> Sorry, I couldn't fetch the weather information. Please try again.</p>`;
//         }
//     } else {
//         // Handle other queries using Gemini API
//         try {
//             const response = await fetchGeminiResponse(message);
//             chatbox.innerHTML += `<p><strong>Bot:</strong> ${response}</p>`;
//         } catch (error) {
//             chatbox.innerHTML += `<p><strong>Bot:</strong> Sorry, I couldn't process your request. Please try again.</p>`;
//         }
//     }

//     chatbox.scrollTop = chatbox.scrollHeight;
// }

// function extractCityFromMessage(message) {
//     // This is a simple extraction. You might want to use a more sophisticated method
//     const words = message.split(' ');
//     return words[words.indexOf('in') + 1] || '';
// }

// function generateWeatherResponse(weatherData) {
//     return `The current weather in ${weatherData.name} is ${weatherData.weather[0].description} with a temperature of ${weatherData.main.temp}°C.`;
// }

// async function fetchGeminiResponse(message) {
//     const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${GEMINI_API_KEY}`
//         },
//         body: JSON.stringify({
//             contents: [{
//                 parts: [{
//                     text: message
//                 }]
//             }]
//         })
//     });

//     if (!response.ok) {
//         throw new Error('Failed to fetch response from Gemini API');
//     }

//     const data = await response.json();
//     return data.candidates[0].content.parts[0].text;
// }

// // Filters
// function filterTemperaturesAscending() {
//     const rows = Array.from(forecastTable.rows);
//     rows.sort((a, b) => parseFloat(a.cells[1].textContent) - parseFloat(b.cells[1].textContent));
//     forecastTable.innerHTML = '';
//     rows.forEach(row => forecastTable.appendChild(row));
//     showPage(1);
// }

// function filterRainyDays() {
//     const rows = Array.from(forecastTable.rows);
//     const filteredRows = rows.filter(row => row.cells[2].textContent.toLowerCase().includes('rain'));
//     forecastTable.innerHTML = '';
//     filteredRows.forEach(row => forecastTable.appendChild(row));
//     showPage(1);
// }

// function findHighestTemperature() {
//     const rows = Array.from(forecastTable.rows);
//     const highestTempRow = rows.reduce((max, row) => {
//         const temp = parseFloat(row.cells[1].textContent);
//         return temp > parseFloat(max.cells[1].textContent) ? row : max;
//     });
//     forecastTable.innerHTML = '';
//     forecastTable.appendChild(highestTempRow);
//     showPage(1);
// }

// function filterTemperaturesDescending() {
//     const rows = Array.from(forecastTable.rows);
//     rows.sort((a, b) => parseFloat(b.cells[1].textContent) - parseFloat(a.cells[1].textContent));
//     forecastTable.innerHTML = '';
//     rows.forEach(row => forecastTable.appendChild(row));
//     showPage(1);
// }

// // Event listeners for filter buttons (add these buttons in your HTML)
// document.getElementById('filterAscending').addEventListener('click', filterTemperaturesAscending);
// document.getElementById('filterRainyDays').addEventListener('click', filterRainyDays);
// document.getElementById('findHighestTemp').addEventListener('click', findHighestTemperature);
// document.getElementById('filterDescending').addEventListener('click', filterTemperaturesDescending);

// // Initialize the dashboard
// getWeather();
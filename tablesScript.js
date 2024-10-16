const TableList = [];

let currentPage = 1;
const entriesPerPage = 5;

const extractTableInfo = (data) => {
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

$(async () => {

    const dataString = localStorage.getItem("weatherData");

    if (!dataString) {
        return;
    }

    const data = JSON.parse(dataString);

    extractTableInfo(data);
    setTable();
});

$("#chatForm").on("submit", (event) => {
    event.preventDefault();

    const chatInput = $("#chatInput");

    console.log($("#chatInput").val());

    chatInput.val("");
})
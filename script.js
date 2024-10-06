let datasets = JSON.parse(localStorage.getItem('datasets')) || [];
let selectedDataset = null;
var allowedFiles = [".csv"];
var regex = new RegExp("([a-zA-Z0-9\s_\\.\-:])+(" + allowedFiles.join('|') + ")$");

document.addEventListener('DOMContentLoaded', loadDatasets);

// Function to process uploaded CSV and save to localStorage
function processCSV() {
    const input = document.getElementById('csvFileInput');
    if (!input.files.length) {
        alert("Please upload a CSV file");
        return;
    }
        else if (!regex.test(input.value.toLowerCase())) {
            alert("Please upload .csv files only");  // allowedFiles.join(', ')
            return;
        }

    const reader = new FileReader();
    reader.onload = function(event) {
        const csvData = event.target.result;
        const parsedData = parseCSV(csvData);

        console.log(parsedData);  // debugging

        const datasetName = prompt("Enter a name for the dataset:");
        
        if (datasetName) {
            const dataset = { id: Date.now(), name: datasetName, data: parsedData };
            datasets.push(dataset);
            localStorage.setItem('datasets', JSON.stringify(datasets));
            loadDatasets();
        }
    };
    reader.readAsText(input.files[0]);
}

function parseCSV(csv) {
    const rows = csv.split('\n').map(row => row.trim().split(','));
    return rows;
}

// Load datasets from localStorage into the table
function loadDatasets() {
    const datasetTable = document.getElementById('datasetTable');
    datasetTable.innerHTML = '';
    
    datasets.forEach(dataset => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${dataset.name}</td>
            <td>
                <button onclick="selectDataset(${dataset.id})">View</button>
                <button onclick="deleteDataset(${dataset.id})">Delete</button>
            </td>
        `;
        datasetTable.appendChild(row);
    });
}

function selectDataset(id) {
    selectedDataset = datasets.find(dataset => dataset.id === id);
    updateChart();
}

function deleteDataset(id) {
    datasets = datasets.filter(dataset => dataset.id !== id);
    localStorage.setItem('datasets', JSON.stringify(datasets));
    loadDatasets();
}

function updateChart() {
    if (!selectedDataset) return;

    const chartType = document.getElementById('chartType').value;
    
    // Extracting labels and values from the selected dataset
    const labels = selectedDataset.data.map(row => row[0]); // Assuming first column is the label
    const values = selectedDataset.data.map(row => parseFloat(row[1]) || 0); // Assuming second column is the values

    // Check if values are valid
    if (values.some(isNaN)) {
        alert("Invalid values found in the dataset.");
        return;
    }

    const ctx = document.getElementById('myChart').getContext('2d');

    if (window.myChart && window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    // Create new chart
    window.myChart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: labels,
            datasets: [{
                label: selectedDataset.name,
                data: values,
                backgroundColor: chartType === 'pie' ? generateColors(values.length) : 'rgba(75, 192, 192, 0.2)',
                borderColor: chartType === 'pie' ? '#fff' : 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: chartType === 'pie' ? {} : {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}


// Generate random colors for pie chart
function generateColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const color = `hsl(${Math.random() * 360}, 100%, 75%)`;
        colors.push(color);
    }
    return colors;
}

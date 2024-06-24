document.getElementById('csvFileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            openInNewTab(text, file.name);
        };
        reader.readAsText(file);
    }
});

//Opens a new window and displays the csv data there with the uploaded file name shown at the top
function openInNewTab(csvText, fileName) {
    const newWindow = window.open();
    if (newWindow) {
        newWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CSV Viewer</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        background-color: #f0f0f0;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    table, th, td {
                        border: 1px solid #ddd;
                    }
                    th, td {
                        padding: 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                </style>
            </head>
            <body>
                <h1>${fileName}</h1> 
                <div id="csvTableContainer"></div>
                <h2>Total Profit: $<span id="totalProfit"></span></h2>
            </body>
            <script>
                function displayCSV(text) {
                    const rows = text.split('\\n').filter(row => row.trim() !== '');
                    let table = '<table>';
                    let totalProfit = 0;
                    let pnlIndex = -1;
                    const columnsToDrop = ['_priceFormat', '_priceFormatType', '_tickSize', 'buyFillId', 'sellFillId'];
                    let indicesToKeep = [];

                    rows.forEach((row, rowIndex) => {
                        const cols = row.split(',');
                        if (rowIndex === 0) {
                            // Identify columns to keep
                            indicesToKeep = cols.map((col, colIndex) => {
                                return columnsToDrop.includes(col.trim()) ? -1 : colIndex;
                            }).filter(index => index !== -1);

                            // Identify the index of the pnl column
                            pnlIndex = cols.findIndex(col => col.trim().toLowerCase() === 'pnl');
                            
                            // Create header row
                            table += '<tr>';
                            indicesToKeep.forEach(index => {
                                table += '<th>' + cols[index].trim() + '</th>';
                            });
                            table += '</tr>';
                        } else {
                            // Create data rows
                            table += '<tr>';
                            indicesToKeep.forEach(index => {
                                table += '<td>' + cols[index].trim() + '</td>';
                                if (index === pnlIndex) {
                                    const profit = parseFloat(cols[index].replace(/[^0-9.-]+/g, ""));
                                    totalProfit += isNaN(profit) ? 0 : profit;
                                }
                            });
                            table += '</tr>';
                        }
                    });
                    table += '</table>';
                    document.getElementById('csvTableContainer').innerHTML = table;
                    document.getElementById('totalProfit').innerText = totalProfit.toFixed(2);
                }
                displayCSV(\`${csvText.replace(/`/g, '\\`')}\`);
            </script>
            </html>
        `);
    } else {
        alert('Please allow popups for this website');
    }
}
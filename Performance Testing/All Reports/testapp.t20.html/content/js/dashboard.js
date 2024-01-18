/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5972222222222222, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.325, 500, 1500, "https://testapp.cisstaging.com/"], "isController": false}, {"data": [0.0, 500, 1500, "https://testapp.cisstaging.com/generator"], "isController": false}, {"data": [0.975, 500, 1500, "https://testapp.cisstaging.com/generator?_rsc=19g6o"], "isController": false}, {"data": [0.575, 500, 1500, "https://api.vcard.cisstaging.com/api/storedata"], "isController": false}, {"data": [0.95, 500, 1500, "https://testapp.cisstaging.com/?_rsc=19g6o"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.975, 500, 1500, "https://testapp.cisstaging.com/generator?_rsc=acgkz"], "isController": false}, {"data": [1.0, 500, 1500, "https://testapp.cisstaging.com/?_rsc=acgkz"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 160, 0, 0.0, 1521.1625000000001, 51, 13209, 355.5, 6510.4000000000015, 8015.299999999999, 10970.29999999995, 6.3757720661486355, 721.874533024507, 3.9965319286710503], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://testapp.cisstaging.com/", 20, 0, 0.0, 1891.3500000000001, 247, 4901, 1634.5, 4094.2000000000007, 4862.549999999999, 4901.0, 1.7102787754403967, 328.11130440824354, 0.9954356935180434], "isController": false}, {"data": ["https://testapp.cisstaging.com/generator", 20, 0, 0.0, 7487.599999999999, 1626, 13209, 7484.5, 9505.5, 13025.499999999996, 13209.0, 1.1046062078868883, 765.448953385618, 0.660174803932398], "isController": false}, {"data": ["https://testapp.cisstaging.com/generator?_rsc=19g6o", 20, 0, 0.0, 198.20000000000002, 51, 973, 134.5, 393.2000000000002, 944.4999999999995, 973.0, 1.3860974426502184, 7.441881367385127, 0.8798470094947675], "isController": false}, {"data": ["https://api.vcard.cisstaging.com/api/storedata", 40, 0, 0.0, 995.15, 315, 2759, 985.5, 1643.3, 1727.7999999999997, 2759.0, 2.2675736961451247, 1.5700290532879817, 1.6132103883219955], "isController": false}, {"data": ["https://testapp.cisstaging.com/?_rsc=19g6o", 20, 0, 0.0, 258.95000000000005, 53, 2208, 136.0, 352.5000000000003, 2115.8499999999985, 2208.0, 1.2097749818533754, 5.348292327002177, 0.7572907845390757], "isController": false}, {"data": ["Test", 20, 0, 0.0, 12169.300000000001, 6795, 16141, 12573.5, 15393.4, 16104.349999999999, 16141.0, 0.8697921196833956, 787.8334089871271, 4.361701693920153], "isController": true}, {"data": ["https://testapp.cisstaging.com/generator?_rsc=acgkz", 20, 0, 0.0, 175.65, 52, 718, 148.5, 252.10000000000002, 694.7499999999997, 718.0, 1.793561115595014, 9.631633373688459, 1.040405569007264], "isController": false}, {"data": ["https://testapp.cisstaging.com/?_rsc=acgkz", 20, 0, 0.0, 167.24999999999997, 58, 374, 159.0, 352.60000000000025, 373.55, 374.0, 1.8053800324968405, 7.9792860850334, 1.0313938662213396], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 160, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

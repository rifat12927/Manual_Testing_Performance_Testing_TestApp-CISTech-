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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5462962962962963, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.31666666666666665, 500, 1500, "https://testapp.cisstaging.com/"], "isController": false}, {"data": [0.0, 500, 1500, "https://testapp.cisstaging.com/generator"], "isController": false}, {"data": [0.95, 500, 1500, "https://testapp.cisstaging.com/generator?_rsc=19g6o"], "isController": false}, {"data": [0.38333333333333336, 500, 1500, "https://api.vcard.cisstaging.com/api/storedata"], "isController": false}, {"data": [0.9166666666666666, 500, 1500, "https://testapp.cisstaging.com/?_rsc=19g6o"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.9833333333333333, 500, 1500, "https://testapp.cisstaging.com/generator?_rsc=acgkz"], "isController": false}, {"data": [0.9833333333333333, 500, 1500, "https://testapp.cisstaging.com/?_rsc=acgkz"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 240, 0, 0.0, 2714.549999999999, 47, 21479, 452.0, 11794.800000000005, 15094.649999999992, 19511.27, 6.495263870094722, 735.4048439614343, 4.071433102165088], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://testapp.cisstaging.com/", 30, 0, 0.0, 3743.6666666666665, 260, 9241, 3529.5, 7891.500000000001, 8664.05, 9241.0, 1.6282225237449117, 312.36908497286294, 0.9476763907734057], "isController": false}, {"data": ["https://testapp.cisstaging.com/generator", 30, 0, 0.0, 13808.533333333331, 5555, 21479, 14391.5, 19148.300000000003, 20498.899999999998, 21479.0, 1.1041589988958411, 765.1390550239234, 0.6599075266838424], "isController": false}, {"data": ["https://testapp.cisstaging.com/generator?_rsc=19g6o", 30, 0, 0.0, 244.63333333333333, 49, 1441, 199.5, 581.3000000000006, 1052.6999999999994, 1441.0, 1.3982102908277405, 7.508553114513423, 0.8875358291387024], "isController": false}, {"data": ["https://api.vcard.cisstaging.com/api/storedata", 60, 0, 0.0, 1593.1000000000004, 334, 7502, 1377.0, 3573.4, 4935.149999999999, 7502.0, 2.1834061135371177, 1.511752865720524, 1.5533314001091703], "isController": false}, {"data": ["https://testapp.cisstaging.com/?_rsc=19g6o", 30, 0, 0.0, 279.9666666666667, 47, 1532, 205.5, 713.6000000000005, 1127.7499999999995, 1532.0, 1.385809312638581, 6.126522224916852, 0.8674841498059868], "isController": false}, {"data": ["Test", 30, 0, 0.0, 21716.399999999998, 8642, 28954, 22829.5, 28244.0, 28773.05, 28954.0, 0.8625894936599673, 781.3108192982834, 4.32558305658587], "isController": true}, {"data": ["https://testapp.cisstaging.com/generator?_rsc=acgkz", 30, 0, 0.0, 207.5, 51, 761, 216.5, 408.7000000000004, 591.5999999999998, 761.0, 1.6824631260164882, 9.033709726038921, 0.9759600555212832], "isController": false}, {"data": ["https://testapp.cisstaging.com/?_rsc=acgkz", 30, 0, 0.0, 245.9, 51, 1454, 208.5, 463.40000000000003, 918.2999999999993, 1454.0, 1.6997167138810199, 7.5142749645892355, 0.9710295679886687], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 240, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

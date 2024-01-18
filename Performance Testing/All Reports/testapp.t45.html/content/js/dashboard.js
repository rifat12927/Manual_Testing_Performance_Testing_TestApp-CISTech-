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

    var data = {"OkPercent": 90.83333333333333, "KoPercent": 9.166666666666666};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4567901234567901, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.08888888888888889, 500, 1500, "https://testapp.cisstaging.com/"], "isController": false}, {"data": [0.0, 500, 1500, "https://testapp.cisstaging.com/generator"], "isController": false}, {"data": [0.9333333333333333, 500, 1500, "https://testapp.cisstaging.com/generator?_rsc=19g6o"], "isController": false}, {"data": [0.23333333333333334, 500, 1500, "https://api.vcard.cisstaging.com/api/storedata"], "isController": false}, {"data": [0.9666666666666667, 500, 1500, "https://testapp.cisstaging.com/?_rsc=19g6o"], "isController": false}, {"data": [0.0, 500, 1500, "Test"], "isController": true}, {"data": [0.7666666666666667, 500, 1500, "https://testapp.cisstaging.com/generator?_rsc=acgkz"], "isController": false}, {"data": [0.8888888888888888, 500, 1500, "https://testapp.cisstaging.com/?_rsc=acgkz"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 360, 33, 9.166666666666666, 4898.505555555554, 47, 35508, 615.5, 22695.500000000004, 28398.049999999996, 32707.399999999998, 6.923476354405063, 785.0120672526781, 3.830111292478412], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://testapp.cisstaging.com/", 45, 0, 0.0, 7532.844444444445, 866, 19428, 8095.0, 13649.0, 14593.799999999996, 19428.0, 1.5743073047858942, 302.02480927922966, 0.916296048488665], "isController": false}, {"data": ["https://testapp.cisstaging.com/generator", 45, 0, 0.0, 27059.088888888884, 16679, 35508, 27721.0, 32204.6, 34085.399999999994, 35508.0, 0.9841012968268201, 681.943757244079, 0.5881542906816543], "isController": false}, {"data": ["https://testapp.cisstaging.com/generator?_rsc=19g6o", 45, 0, 0.0, 295.51111111111106, 52, 1706, 234.0, 513.1999999999999, 1126.9999999999975, 1706.0, 1.8921078080982214, 10.16084066087121, 1.2010449953748474], "isController": false}, {"data": ["https://api.vcard.cisstaging.com/api/storedata", 90, 33, 36.666666666666664, 1490.011111111111, 347, 6807, 1339.5, 2717.8000000000006, 3840.400000000001, 6807.0, 3.4290939571744268, 4.602040549036044, 1.429682142040692], "isController": false}, {"data": ["https://testapp.cisstaging.com/?_rsc=19g6o", 45, 0, 0.0, 292.75555555555553, 47, 1733, 246.0, 465.59999999999997, 833.2999999999979, 1733.0, 1.8766420618040784, 8.296443958776429, 1.1747339468910296], "isController": false}, {"data": ["Test", 45, 21, 46.666666666666664, 39188.066666666666, 26555, 46747, 40357.0, 44879.0, 46063.09999999999, 46747.0, 0.9026900162484203, 818.8054895776916, 3.9949910107119218], "isController": true}, {"data": ["https://testapp.cisstaging.com/generator?_rsc=acgkz", 45, 0, 0.0, 630.5333333333334, 95, 3267, 252.0, 1660.0, 2537.099999999996, 3267.0, 1.592920353982301, 8.554168971238939, 0.9240182522123894], "isController": false}, {"data": ["https://testapp.cisstaging.com/?_rsc=acgkz", 45, 0, 0.0, 397.2888888888888, 103, 1818, 246.0, 853.8, 1410.0999999999967, 1818.0, 1.5985790408525755, 7.066322990674956, 0.9132507215808171], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: api.vcard.cisstaging.com:443 failed to respond", 19, 57.57575757575758, 5.277777777777778], "isController": false}, {"data": ["Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host terminated the handshake", 14, 42.42424242424242, 3.888888888888889], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 360, 33, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: api.vcard.cisstaging.com:443 failed to respond", 19, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host terminated the handshake", 14, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://api.vcard.cisstaging.com/api/storedata", 90, 33, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: api.vcard.cisstaging.com:443 failed to respond", 19, "Non HTTP response code: javax.net.ssl.SSLHandshakeException/Non HTTP response message: Remote host terminated the handshake", 14, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

Telemetry = {
    subscribeSensors: [
        //'USLAB000035', // X axis velocity
        //'USLAB000058', // Cabin air pressure
        //'USLAB000059', // Cabin air temperature
        //'NODE3000001', // Oxygen
        //'NODE3000002', // Nitrogen
        //'NODE3000003', // CO2
        //'NODE3000008', // Waste water
        //'NODE3000009', // Clean water
        'P4000001', // Solar array 2A voltage
        'P4000004', // Solar array 4A voltage
        'P6000001', // Solar array 4B voltage
        'P6000004', // Solar array 2B voltage
        'S4000001', // Solar array 1A voltage
        'S4000004', // Solar array 3A voltage
        'S6000001', // Solar array 3B voltage
        'S6000004', // Solar array 1B voltage
    ],
    voltageChart: null,
    voltageChartSeries: [
        {name: '2A', data: [2]},
        {name: '4A', data: [0]},
        {name: '4B', data: [7]},
        {name: '2B', data: [0]},
        {name: '1A', data: [4]},
        {name: '3A', data: [0]},
        {name: '3B', data: [0]},
        {name: '1B', data: [0]}
    ],
    voltageChartDataAdd: function(name, value) {
        for(var i in Telemetry.voltageChartSeries) {
            if(name == Telemetry.voltageChartSeries[i].name) {
                Telemetry.voltageChartSeries[i].data = [parseFloat(parseFloat(value).toFixed(2))];
            }
        }
    },

    init: function () {


        var client = new Lightstreamer.LightstreamerClient('http://push.lightstreamer.com', 'ISSLIVE');
        client.connect();
        var subscription = new Lightstreamer.Subscription("MERGE", Telemetry.subscribeSensors, ['Value']);
        client.subscribe(subscription);
        subscription.addListener({
            onSubscription: null,
            onUnsubscription: null,
            onItemUpdate: (function (update) {
                var sensorName = update.getItemName();
                var value = update.getValue('Value');

                if (sensorName == 'P4000001') Telemetry.voltageChartDataAdd('2A', value);
                if (sensorName == 'P4000004') Telemetry.voltageChartDataAdd('4A', value);
                if (sensorName == 'P6000001') Telemetry.voltageChartDataAdd('4B', value);
                if (sensorName == 'P6000004') Telemetry.voltageChartDataAdd('2B', value);
                if (sensorName == 'S4000001') Telemetry.voltageChartDataAdd('1A', value);
                if (sensorName == 'S4000004') Telemetry.voltageChartDataAdd('3A', value);
                if (sensorName == 'S6000001') Telemetry.voltageChartDataAdd('3B', value);
                if (sensorName == 'S6000004') Telemetry.voltageChartDataAdd('1B', value);


                Telemetry.initVoltageChart();

                //Telemetry.voltageChart.series[0].setData(Telemetry.voltageChartSeries);
                //chart.redraw();
            })
        });


    },

    initVoltageChart: function () {

        Telemetry.voltageChart = jQuery('#voltage-chart').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: 'Solar Arrays'
            },
            xAxis: {

            },
            yAxis: {
                title: {
                    text: 'Voltage'
                }
            },
            legend: {
                align: 'right',
                x: -30,
                verticalAlign: 'top',
                y: 25,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || 'white',
                borderColor: '#CCC',
                borderWidth: 1,
                shadow: false
            },
            plotOptions: {
                column: {
                    dataLabels: {
                        enabled: true,
                        color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                        style: {
                            textShadow: '0 0 3px black'
                        }
                    }
                }
            },
            series: Telemetry.voltageChartSeries
        });
    }
}

$(document).ready(function () {
    Telemetry.init();
});

Telemetry = {
    subscribeSensors: [
        'USLAB000035', // X axis velocity
        'USLAB000058', // Cabin air pressure
        'USLAB000059', // Cabin air temperature
        'NODE3000001', // Oxygen
        'NODE3000002', // Nitrogen
        'NODE3000003', // CO2
        'NODE3000008', // Waste water
        'NODE3000009', // Clean water
        'P4000001', // Solar array 2A voltage
        'P4000004', // Solar array 4A voltage
        'P6000001', // Solar array 4B voltage
        'P6000004', // Solar array 2B voltage
        'S4000001', // Solar array 1A voltage
        'S4000004', // Solar array 3A voltage
        'S6000001', // Solar array 3B voltage
        'S6000004', // Solar array 1B voltage
    ],

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
                var value = update.getValue('Value')


            })
        });
    }
}

$(document).ready(function () {
    Telemetry.init();
});

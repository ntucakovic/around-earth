var App = {
    user: {},
    map: null,
    stationMarker: null,
    userMarker: null,
    geocoder: null,
    tickerLastUpdated: false,
    toolbarRightOpen: true,
    mapInitialized: false,
    apiEndpoint: 'http://dev.byteout.com/around-earth/backend/',
    trackSatellite: 'ISS (ZARYA)',
    orbitLine: null,
    dayNightTerminator: null,

    toggleSidebar: function () {
        var $sidebar = $('#toolbar-right'),
            width = $sidebar.outerWidth();

        if ($sidebar.is('.active')) {
            $sidebar.removeClass('active').animate({'right': -width}, 300);
            App.toolbarRightOpen = false;
        } else {
            $sidebar.addClass('active').animate({'right': 0}, 200);
            App.toolbarRightOpen = true;
        }
    },

    repositionToolbarRight: function () {
        var $sidebar = $('#toolbar-right'),
            width = $sidebar.outerWidth();

        $sidebar.css('right', -width);
    },

    initializeMap: function (data) {
        var latitude = parseFloat(data.position.latitude);
        var longitude = parseFloat(data.position.longitude);
        var stationPosition = new google.maps.LatLng(latitude, longitude);
        var mapCenter = new google.maps.LatLng(0, longitude);
        App.geocoder = new google.maps.Geocoder();
        App.updateAltitudeChart(data);

        var options = {
            styles: styles,
            center: mapCenter,
            zoom: 2,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            minZoom: 2,
            backgroundColor: '#1D252A', // map's BG color
        };

        App.map = new google.maps.Map(document.getElementById("map"), options);

        App.dayNightTerminator = new DayNightOverlay({
            map: App.map,
            fillColor: 'rgba(0,0,0,0.5)',
            date: new Date(Date.UTC())
        });

        var image = {
            url: 'public/assets/station-white.png',
            size: new google.maps.Size(169, 62),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(32, 11),
            scaledSize: new google.maps.Size(64, 22)
        };

        App.stationMarker = new google.maps.Marker({
            position: stationPosition,
            icon: image,
            map: App.map
        });

        App.drawOrbit(data);

        var locationImg = {
            url: 'public/assets/location.png',
            size: new google.maps.Size(81, 81),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(40, 55),
        };

        var userPosition = new google.maps.LatLng(App.userPosition.latitude, App.userPosition.longitude);
        App.userMarker = new google.maps.Marker({
            position: userPosition,
            icon: locationImg,
            draggable: true,
            map: App.map
        });

        google.maps.event.addListener(App.userMarker, 'dragend', function (event) {
            App.userPosition.latitude = event.latLng.lat();
            App.userPosition.longitude = event.latLng.lng();
        });

        $('#label-satellite').html(data.satellite);
    },

    drawOrbit: function(data){
        var orbit = [];
        for (i in data.orbit) {
            var latitude = parseFloat(data.orbit[i].latitude);
            var longitude = parseFloat(data.orbit[i].longitude);

            var point = new google.maps.LatLng(latitude, longitude);
            orbit.push(point);
        }

        if(App.orbitLine) {
            App.orbitLine.setMap(null);
        }

        App.orbitLine = new google.maps.Polyline({
            path: orbit,
            geodesic: false,
            strokeColor: '#ffffff', // orbitPath color
            strokeOpacity: 0.6,
            strokeWeight: 3
        });

        App.orbitLine.setMap(App.map);
    },

    updateStationPosition: function (position) {
        if (App.mapInitialized) {
            position = {
                latitude: App.userPosition.latitude,
                longitude: App.userPosition.longitude,
                altitude: App.userPosition.altitude
            }
        }

        $.ajax({
            data: {
                satellite: App.trackSatellite,
                user_latitude: position.latitude,
                user_longitude: position.longitude,
                user_altitude: position.altitude
            },
            method: 'POST',
            url: App.apiEndpoint + 'iss.php',
            dataType: 'json',
            success: function (data) {
                var latitude = parseFloat(data.position.latitude);
                var longitude = parseFloat(data.position.longitude);

                if (App.mapInitialized) {
                    var newLatLng = new google.maps.LatLng(latitude, longitude);
                    App.stationMarker.setPosition(newLatLng);
                    App.dayNightTerminator.setDate(Date.UTC());
                } else {
                    App.initializeMap(data);
                    var interval = 1000 * 5; // where X is your every X seconds
                    setInterval(App.updateStationPosition, interval);

                    App.mapInitialized = true;
                }

                App.updateRightPanel(data);
                App.updateTicker(data);
                App.drawOrbit(data);

            }
        });
    },

    updateTicker: function(data) {
        var timestamp = Math.round(+new Date()/1000);
        if(App.tickerLastUpdated == false || timestamp > App.tickerLastUpdated + 60) {
            App.tickerLastUpdated = timestamp;
            var latLng = new google.maps.LatLng(data.position.latitude, data.position.longitude);
            App.geocoder.geocode({'latLng': latLng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              if(results[0]) {
                $('#label-passing-over').html(results[0].formatted_address);
              } else {
                $('#label-passing-over').html('Ocean');
              }
            }
            });
        }
    },

    updateRightPanel: function (data) {
        $('#label-latitude').html(parseFloat(data.position.latitude).toFixed(5));
        $('#label-longitude').html(parseFloat(data.position.longitude).toFixed(5));
        $('#label-altitude').html(parseFloat(data.position.altitude).toFixed(2) + ' km');
        $('#label-epoch').html(data.tle.epoch_year + data.tle.epoch_day);
        $('#label-raan').html(data.tle.right_ascension);
        $('#label-argp').html(data.tle.arg_perigee);
        $('#label-ecce').html(data.tle.eccentricity);
        $('#label-inclination').html(data.tle.inclination);
        $('#label-mean-motion').html(data.tle.mean_motion);
        $('#label-ma').html(data.tle.mean_anomaly);
        $('#label-drag').html(data.tle.bstar);
        $('#label-satellite').html(data.satellite);
        var periodMins = parseInt(data.tle.orbit_time / 60);
        $('#label-period').html('~' + periodMins + ' min');

        var compass_rotation = data.user_view.azimuth;
        var elevation = data.user_view.elevation * -1;

        $('#user-view-elevation #label-elvation').html(parseInt(data.user_view.elevation) + '°');
        $('#user-view-compass #label-azimuth').html(parseInt(compass_rotation) + '°');
        $('#user-view-compass #station').css('transform', 'rotate(' + compass_rotation + 'deg)');
        $('#user-view-elevation #elevation').attr('transform', 'rotate(' + elevation + ' 0 55)');
    },

    updateAltitudeChart: function(data) {
        var altitudes = [];
        var categories = [];
        for(var i in data.orbit) {
            altitudes.push(parseFloat(data.orbit[i].altitude.toFixed(2)));
            var date = new Date(data.orbit[i].timestamp * 1000);
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var seconds = "0" + date.getSeconds();

            categories.push(date.toUTCString());
        }

        $('#altitude-chart').highcharts({
            xAxis: {
                categories: categories,
                labels: {
                   enabled: false
               },
            },
            yAxis: {
                title: {
                    text: 'Altitude (km)'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: ' km'
            },
            series: [{
                name: data.satellite,
                data: altitudes
            }]
        });
    }

};

(function ($) {
    $(document).ready(function () {
        var height = $(document).height();
        var width = $(document).width();

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                position.latitude = position.coords.latitude;
                position.longitude = position.coords.longitude;
                position.altitude = position.coords.altitude ? position.coords.altitude : 0;

                App.userPosition = position;
                App.updateStationPosition(position);
            });
        } else {
            position = {
                latitude: 28.396837,
                longitude: -80.605659,
                altitude: 0
            };

            App.userPosition = position;
            App.updateStationPosition(position);
        }

        if (App.toolbarRightOpen) {
            $('#toolbar-right').addClass('active');
        } else {
            $('#toolbar-right').removeClass('active');
        }

        $('#toolbar-right-toggle').click(App.toggleSidebar);

        $(window).resize(function () {
            if (!App.toolbarRightOpen) {
                App.repositionToolbarRight();
            }
        });

        $('#select-satellite').multiselect({
            maxHeight: 300,
            buttonWidth: 200,
            enableFiltering: true,
            enableCaseInsensitiveFiltering: true
        });
        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="popover"]').popover();

        $('#select-satellite').change(function(){
            App.trackSatellite = $(this).val();





        });
    });
})(jQuery)

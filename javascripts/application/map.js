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

        var image = {
            url: 'assets/station-white.png',
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

        var orbit = [];
        for (i in data.orbit) {
            var latitude = parseFloat(data.orbit[i].latitude);
            var longitude = parseFloat(data.orbit[i].longitude);

            var point = new google.maps.LatLng(latitude, longitude);
            orbit.push(point);
        }

        var orbitPath = new google.maps.Polyline({
            path: orbit,
            geodesic: false,
            strokeColor: '#ffffff', // orbitPath color
            strokeOpacity: 0.6,
            strokeWeight: 3
        });

        orbitPath.setMap(App.map);

        var locationImg = {
            url: 'assets/location.png',
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
                    App.updateRightPanel(data);
                    App.updateTicker(data);
                } else {
                    App.initializeMap(data);
                    var interval = 1000 * 5; // where X is your every X seconds
                    setInterval(App.updateStationPosition, interval);

                    App.mapInitialized = true;
                    App.updateRightPanel(data);
                    App.updateTicker(data);
                }

            }
        });
    },

    updateTicker: function(data) {
        var timestamp = Math.round(+new Date()/1000);
        if(App.tickerLastUpdated == false || App.tickerLastUpdated > timestamp + 60) {
            App.tickerLastUpdated = timestamp;
            var latLng = new google.maps.LatLng(data.position.latitude, data.position.longitude);
            App.geocoder.geocode({'latLng': latLng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              if(results[0]) {
                var country = results[0].formatted_address;
                console.log(country);
                // ToDo: display info

              }
            }
            });
        }

    },

    updateRightPanel: function (data) {
        $('#label-latitude').html(parseFloat(data.position.latitude).toFixed(5));
        $('#label-longitude').html(parseFloat(data.position.longitude).toFixed(5));
        $('#label-altitude').html(parseFloat(data.position.altitude).toFixed(5));
        $('#label-epoch').html(data.tle.epoch_year + data.tle.epoch_day);
        $('#label-raan').html(data.tle.right_ascension);
        $('#label-argp').html(data.tle.arg_perigee);
        $('#label-ecce').html(data.tle.eccentricity);
        $('#label-inclination').html(data.tle.inclination);
        $('#label-mean-motion').html(data.tle.mean_motion);
        $('#label-ma').html(data.tle.mean_anomaly);
        $('#label-drag').html(data.tle.bstar);

        var compass_rotation = data.user_view.azimuth;
        var elevation = data.user_view.elevation * -1;

        $('#user-view-elevation #label-elvation').html(parseInt(data.user_view.elevation) + '°');
        $('#user-view-compass #label-azimuth').html(parseInt(compass_rotation) + '°');
        $('#user-view-compass #station').css('transform', 'rotate(' + compass_rotation + 'deg)');
        $('#user-view-elevation #elevation').attr('transform', 'rotate(' + elevation + ' 0 55)');
    },
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

        $('[data-toggle="tooltip"]').tooltip();
        $('[data-toggle="popover"]').popover();
    });
})(jQuery)

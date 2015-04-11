var App = {
    user: {},
    map: null,
    stationMarker: null,
    userMarker: null,
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

        var options = {
            styles: styles,
            center: mapCenter,
            zoom: 2,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            minZoom: 2,
            backgroundColor: '#1D252A',
        };

        App.map = new google.maps.Map(document.getElementById("map"), options);

        App.stationMarker = new google.maps.Marker({
            position: stationPosition,
            icon: 'assets/station.png',
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
            strokeColor: '#B8F0B8',
            strokeOpacity: 0.8,
            strokeWeight: 3
        });

        orbitPath.setMap(App.map);

        var userPosition = new google.maps.LatLng(App.userPosition.latitude, App.userPosition.longitude);
        App.userMarker = new google.maps.Marker({
            position: userPosition,
            // icon: 'assets/station.png',
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
                } else {
                    App.initializeMap(data);
                    var interval = 1000 * 5; // where X is your every X seconds
                    setInterval(App.updateStationPosition, interval);

                    App.mapInitialized = true;
                    App.updateRightPanel(data);
                }

            }
        });
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

        console.log(compass_rotation, data.user_view.elevation);

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
    });
})(jQuery)

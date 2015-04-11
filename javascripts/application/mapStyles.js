var styles = [
    {
      "featureType":"all",
      "elementType":"labels",
      "stylers":[
        {"visibility":"off"}
      ]
    },
    { featureType: "road", stylers: [ { visibility: "off" } ] },
  { featureType: "transit", stylers: [ { visibility: "off" } ] },
  { featureType: "poi", stylers: [ { visibility: "off" } ] },
  //{ featureType: "landscape", stylers: [ { visibility: "off" } ] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [
      { visibility: "off" }
    ]
  },
  {
    featureType: 'water',
    elementType: 'geometry.fill',
    stylers: [
      { color: '#002F4C' }
    ]
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [
      {
        color: '#456A87',
        hue: '#B8F0B8',
      }
    ]
  },
];

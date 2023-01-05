mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    zoom: 1.5
});

const getLocations = async () => {
    let geojson = {
        'type': 'FeatureCollection',
        'features': []
    };
    
    for await (const route of [ 261, 461, 462, 563 ]) {
        const response = await fetch(
            `https://www.smartbus.org/DesktopModules/Smart.Endpoint/proxy.ashx?method=getvehiclesbyroute&routeid=${route}`,
            { method: 'GET' }
        );
        const json = await response.json();
        geojson.features.push(...json['bustime-response'].vehicle.map(vehicle => {
            return {
                type: 'Feature',
                geometry: {
                    type: 'Point',
                    coordinates: [ vehicle.lon, vehicle.lat ]
                },
                properties: {
                    text: `${vehicle.rt} - #${vehicle.vid}`,
                    hdg: vehicle.hdg
                }
            };
        }));
    }
    
    return geojson;
};

const updateSource = setInterval(async () => {
    const geojson = await getLocations();
    map.getSource('realtime').setData(geojson);
}, 10000);

map.on('load', async () => {
    const geojson = await getLocations();
    
    map.addSource('realtime', {
        type: 'geojson',
        data: geojson
    });
    
    map.addLayer({
        id: "realtime-circle",
        type: "circle",
        source: "realtime",
        paint: {
            "circle-radius": 8,
            "circle-color": "rgba(189, 189, 189, 0.97)",
            "circle-stroke-width": 2
        },
    });
    
    map.addLayer({
        id: "realtime-icons",
        type: "symbol",
        source: "realtime",
        layout: {
            "icon-image": "bus",
            "icon-allow-overlap": true,
            "icon-size": 1,
            "icon-rotate": ['to-number', ['get', 'hdg']],
            "text-allow-overlap": true,
            "text-ignore-placement": true,
            "text-field": ['get', 'text'],
            "text-offset": [0, 1]
        }
    });
});
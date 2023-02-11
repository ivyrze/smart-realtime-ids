import arrow from '../asset/arrow.png';

mapboxgl.accessToken = process.env.MAPBOX_ACCESS_TOKEN;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [ -83.1195, 42.4258 ],
    zoom: 9
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
        
        let vehicles = json['bustime-response'].vehicle;
        if (!vehicles) { continue; }
        else if (!Array.isArray(vehicles)) { vehicles = [ vehicles ]; }
        
        vehicles = vehicles.map(vehicle => {
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
        });
        
        geojson.features.push(...vehicles);
    }
    
    return geojson;
};

const updateSource = setInterval(async () => {
    const geojson = await getLocations();
    map.getSource('realtime').setData(geojson);
}, 10000);

const arrowElem = document.createElement('img');
arrowElem.src = arrow;

map.on('load', async () => {
    const geojson = await getLocations();
    
    if (!map.hasImage('arrow')) {
        map.addImage('arrow', arrowElem);
    }
    
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
        paint: {
            "text-halo-color": "hsla(0, 0%, 95%, 0.80)",
            "text-halo-width": 4
        },
        layout: {
            "icon-image": "arrow",
            "icon-allow-overlap": true,
            "icon-size": 0.1,
            "icon-rotate": ['to-number', ['get', 'hdg']],
            "text-font": [ "DIN Pro Medium" ],
            "text-allow-overlap": true,
            "text-ignore-placement": true,
            "text-field": ['get', 'text'],
            "text-offset": [0, 1.25]
        }
    });
});
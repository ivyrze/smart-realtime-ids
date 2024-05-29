const adapters = {
    bustime: data => {
        let vehicles = data['bustime-response'].vehicle;
        if (!vehicles) { return []; }

        vehicles = Array.isArray(vehicles) ? vehicles : [ vehicles ];
        vehicles = vehicles.map(vehicle => ({
            id: vehicle.vid,
            lat: vehicle.lat,
            lon: vehicle.lon,
            route: vehicle.rt,
            heading: vehicle.hdg
        }));

        return vehicles;
    }
};

export const endpoints = {
    smart: {
        url: routeIds => `https://transit.det.city/.netlify/functions/route?agency=smart&routeId=${routeIds.join(',')}`,
        type: 'json',
        adapter: adapters.bustime,
        proxy: false
    },
    ddot: {
        url: routeIds => `https://transit.det.city/.netlify/functions/route?agency=ddot&routeId=${routeIds.join(',')}`,
        type: 'json',
        adapter: adapters.bustime,
        proxy: false
    },
    theride: {
        url: routeIds => `https://transit.det.city/.netlify/functions/route?agency=theride&routeId=${routeIds.join(',')}`,
        type: 'json',
        adapter: adapters.bustime,
        proxy: false
    }
};
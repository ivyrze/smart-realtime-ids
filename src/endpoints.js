import bindings from 'gtfs-realtime-bindings';

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
    },
    protobuf: (data, routeIds) => {
        const message = bindings.transit_realtime.FeedMessage.decode(
            new Uint8Array(data)
        );

        return message.entity.map(({ vehicle }) => ({
            id: vehicle.vehicle.id,
            lat: vehicle.position.latitude,
            lon: vehicle.position.longitude,
            route: vehicle.trip.routeId,
            heading: vehicle.position.bearing
        })).filter(vehicle => {
            return routeIds.includes(vehicle.route);
        });
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
    },
    cata: {
        url: () => `http://developers.cata.org/gtfsrt/vehicle/VehiclePositions.pb`,
        type: 'arraybuffer',
        adapter: adapters.protobuf,
        proxy: true
    }
};
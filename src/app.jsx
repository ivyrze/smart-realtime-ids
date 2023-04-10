import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import { Map } from './map';

export const App = () => {
    const [ locations, setLocations ] = useState();
    const routes = [ 261, 461, 462, 563 ];
    
    const requestQueue = useMemo(() => {
        return rateLimit(axios.create(), { maxRPS: 2 });
    }, []);
    
    const fetchLocations = async routes => {
        let geojson = {
            'type': 'FeatureCollection',
            'features': []
        };
        
        for await (const route of routes) {
            const json = (await requestQueue.get(
                `https://www.smartbus.org/DesktopModules/Smart.Endpoint/proxy.ashx?method=getvehiclesbyroute&routeid=${route}`,
            ))?.data;
            
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
        
        setLocations(geojson);
    };
    
    useEffect(() => {
        const interval = setInterval(fetchLocations(routes), 10000);
        return () => clearInterval(interval);
    }, [ fetchLocations ]);
    
    return (
        <Map locations={ locations } />
    );
};
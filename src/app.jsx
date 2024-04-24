import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import Select from 'react-select';
import { Map } from './map';
import routeNames from './route-names.json';

export const App = () => {
    const [ locations, setLocations ] = useState();
    const defaultRoutes = routeNames.map(group => group.options).flat().filter(route => route.default);
    const [ routes, setRoutes ] = useState(defaultRoutes);
    
    const requestQueue = useMemo(() => {
        return rateLimit(axios.create(), { maxRPS: 2 });
    }, []);
    
    const fetchLocations = useMemo(() => async routes => {
        let geojson = {
            'type': 'FeatureCollection',
            'features': []
        };

        const groupedRoutes = Object.groupBy(routes, route => {
            return route.value.split("-")[0];
        });

        await Promise.all(Object.keys(groupedRoutes).map(async agencyId => {
            const routeIds = groupedRoutes[agencyId].map(route => {
                return route.value.split("-")[1];
            }).join(',');

            const json = (await requestQueue.get(
                `https://transit.det.city/.netlify/functions/route?routeId=${routeIds}&agency=${agencyId}`,
            ))?.data;
            
            let vehicles = json['bustime-response'].vehicle;
            if (!vehicles) { return; }
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
        }));
        
        setLocations(geojson);
    }, []);
    
    useEffect(() => {
        fetchLocations(routes);
        if (!routes?.length) { return; }
        
        const interval = setInterval(() => fetchLocations(routes), 10000);
        return () => clearInterval(interval);
    }, [ fetchLocations, routes ]);
    
    return (
        <>
            <Map locations={ locations } />
            <Select
                className="route-select"
                onChange={ setRoutes }
                defaultValue={ defaultRoutes }
                options={ routeNames }
                isMulti={ true } />
        </>
    );
};
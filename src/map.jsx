import React, { useRef, useEffect } from 'react';
import MapboxGL from 'mapbox-gl/dist/mapbox-gl';
import Mapbox, { Source, Layer } from 'react-map-gl';
import mapboxStyle from './mapbox-style.json';
import arrow from '../asset/arrow.png';
import 'mapbox-gl/dist/mapbox-gl.css';

export const Map = props => {
    const { locations } = props;
    const map = useRef();
    
    useEffect(() => {
        if (map.current && !map.current.hasImage('arrow')) {
            map.current.loadImage(arrow, (error, image) => {
                if (error) { throw error; }
                map.current.addImage('arrow', image);
            });
        }
    }, [ map.current, arrow ]);
    
    const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
    
    return (
        <div id="map">
            <Mapbox
                ref={ map }
                mapLib={ MapboxGL }
                mapboxAccessToken={ accessToken }
                mapStyle="mapbox://styles/mapbox/streets-v12"
                initialViewState={{
                    longitude: -83.1195,
                    latitude: 42.4258,
                    zoom: 9
                }} >
                { locations && <Source id="realtime" type="geojson" data={ locations }>
                    { mapboxStyle.map(layer => (
                        <Layer key={ layer.id } {...layer} />
                    )) }
                </Source> }
            </Mapbox>
        </div>
    );
};
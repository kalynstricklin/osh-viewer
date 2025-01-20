import React, { useEffect, useState, useRef } from "react";
import '../../map.css';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Chart } from "chart.js";
// @ts-ignore
import ObservationFilter from "osh-js/source/core/sweapi/observation/ObservationFilter.js";
import "leaflet-sidebar-v2";
import "leaflet-sidebar-v2/css/leaflet-sidebar.min.css";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    LineController,
} from 'chart.js';
import {useAppDispatch, useAppSelector} from "../../state/Hooks";
import {
    selectFeatureOfInterestDatastreams,
    setMapView
} from "../../state/Slice";
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import DraggableDialog from "../decorators/DraggableDialog";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    LineController,
    Title,
    Tooltip,
    Legend
);


export default function MapComponent() {
    const dispatch = useAppDispatch();
    let featuresDatastreams = useAppSelector(selectFeatureOfInterestDatastreams);

    const mapRef = useRef(null);
    const [features, setFeatures] = useState(featuresDatastreams);

    const [dialogContent, setDialogContent] = useState<JSX.Element>(null);
    const [dialogOpen, setDialogOpen] = useState(false);


    const defaultIcon = L.icon({
        iconUrl: '/icons/mapMarker.svg',
        iconSize: [38, 95],
        shadowSize: [50, 64],
        iconAnchor: [22, 94],
        shadowAnchor: [4, 62],
        popupAnchor: [-3, -76]
    });

    useEffect(() => {
        setFeatures(featuresDatastreams);

        if (mapRef.current) return;

        mapRef.current = L.map('map').setView([23.69781, 120.960515], 8);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(mapRef.current);

        dispatch(setMapView(mapRef.current))
    }, [featuresDatastreams]);


    useEffect(() => {
        if (!mapRef.current || !features) return;

        features.forEach((value, key) => {
            let marker = L.marker([key.properties.geometry.coordinates[1], key.properties.geometry.coordinates[0]], { icon: defaultIcon });
            marker.bindPopup(`<b>Station ID:</b> ${key.properties.properties.name} <br> <b>Coordinates:</b> ${key.properties.geometry.coordinates[1]}, ${key.properties.geometry.coordinates[0]}`).addTo(mapRef.current);


            // Handle the marker click event
            marker.on('click', async function () {

                const featureObservations = await fetchObservationsForMarker(value);
                console.log('feature observations for point marker', featureObservations);

                const content = createContent(featureObservations, key.properties.properties.name);

                console.log('content', content)
                setDialogContent(content);
                setDialogOpen(true);

            });

            marker.addTo(mapRef.current);

        });
    }, [features]);

    //fetch observations specific for one pointmarker that has been selected!
    async function fetchObservationsForMarker(value: any){
        let featureObservations: { [key: string]: { datastreamName: any; value: any; timeStamp: string }[] } = {};

        await Promise.all(value.map(async (datastream: any) => {
            try {
                const observations = await fetchObservations(datastream);
                if (observations && observations.length > 0) {
                    observations.forEach((obs: any) => {
                        let dsName = datastream.properties.name;
                        let resultName = Object.keys(obs.result)[0];
                        let resultVal = Object.values(obs.result)[0];
                        let resultTimestamp = obs.resultTime;

                        if (!featureObservations[resultName]) {
                            featureObservations[resultName] = [];
                        }
                        featureObservations[resultName].push({ datastreamName: dsName, value: resultVal, timeStamp: resultTimestamp });
                    });
                }
            } catch (error: any) {
                console.warn("Error fetching observations,", error);
            }
        })
        );
        return featureObservations;
    }

    function createContent(featureObservations: { [key: string]: { datastreamName: string; value: any; timeStamp: string }[] }, title: string) {
        const charts = Object.keys(featureObservations).map((key) => {

            const data = featureObservations[key];
            const labels = data.map((o) => o.timeStamp);
            const values = data.map((o) => o.value);

            if (key === 'status' || key === 'pollutant' || key=== 'dailyextremelowairtemperaturetime' || key === 'dailyextremehighairtemperaturetime') {
                //table
                console.log('creating table', key)
                return  (
                    <div key={key}  id={`table-${key}`}>
                        <h4>{key}</h4>
                        <TableContainer>
                            <Table size="small" aria-label={title}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Observation</TableCell>
                                        <TableCell>TimeStamp</TableCell>
                                        <TableCell>Value</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data
                                        .filter((val) => val.value !== ' ')
                                        .map((val, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{key}</TableCell>
                                                <TableCell>{val.timeStamp}</TableCell>
                                                <TableCell>{val.value}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </div>
                );
            }
            else if(key === '即時影像'){
                //image
                const imageUrl = data;

                console.log('imageUrl', imageUrl)

                // && imageUrl.includes('.jpg')
                return (
                    <div key={key} id={`video-${key}`} style={{width: "400px", height: "300px"}}>
                        <h4>{key}</h4>
                        {imageUrl.map((imgUrl, index) => (
                            <img key={index} src={imgUrl.value} alt={key} style={{width: "400px", height: "auto"}}/>
                        ))}

                    </div>
                );
            }
            else{
                //chart

                const canvasId = `canvas-${key}}`;

                let charts = Chart.getChart(canvasId);
                if(charts != undefined){
                    charts.destroy();
                }

                const initChartData = {
                    labels: labels,
                    datasets: [
                        {
                            label: key,
                            data: values,
                            borderColor: 'blue',
                            borderWidth: 1,
                        },
                    ],
                };

                const chartOptions = {
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: title
                        }
                    }
                };


                let canvas = document.getElementById(canvasId) as HTMLCanvasElement;

                if(!canvas){
                    canvas = document.createElement('canvas');
                    canvas.id = canvasId;
                    document.getElementById(`chart-${key}`)?.appendChild(canvas);
                }

                new Chart(canvas.getContext('2d'), {
                    type: 'line',
                    data: initChartData,
                    options: chartOptions,
                });

                return (
                    <div key={key} id={`chart-${key}`} style={{width: "350px", height: "300px"}}>
                        <h4>{key}</h4>
                        <canvas id={`canvas-${key}`}/>
                    </div>
                );
            }
        });

        return (
            <div>
                <h3>{title}</h3>
                {charts}
            </div>
        )


    }
    async function fetchObservations(ds: any) {
        try {
            const obsCol = await ds.searchObservations(new ObservationFilter(), 10000);
            const obs = await obsCol.nextPage();
            return obs;
        } catch (error: any) {
            console.warn('error fetching obs', error);
            return null;
        }
    }

    return (
        <div>
            <div id="map" style={{ width: '100%', height: '1200px' }}></div>

            {dialogOpen && (
                <DraggableDialog title="Observation Details" onClose={() => setDialogOpen(false)}>
                    {dialogContent}
                </DraggableDialog>
            )}
        </div>
    );
}

/*
 * Copyright (c) 2022.  Botts Innovative Research, Inc.
 * All Rights Reserved
 *
 * opensensorhub/osh-viewer is licensed under the
 *
 * Mozilla Public License 2.0
 * Permissions of this weak copyleft license are conditioned on making available source code of licensed
 * files and modifications of those files under the same license (or in certain cases, one of the GNU licenses).
 * Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.
 * However, a larger work using the licensed work may be distributed under different terms and without
 * source code for files added in the larger work.
 *
 */

import React, {useEffect, useState} from "react";
import Settings from "./settings/Settings";
import ContextMenu from "./menus/ContextMenu";
import {
    addFeatureOfInterestDatastreams,
    addFeatureOfInterests,
    addObservable,
    addPhysicalSystem,
    addSensorHubServer,
    selectAddServerDialogOpen,
    selectAppInitialized,
    selectConnectedObservables, selectFeaturesOfInterestDialogOpen,
    selectObservables,
    selectObservablesDialogOpen,
    selectServerManagementDialogOpen,
    selectSettingsDialogOpen,
    selectSystemsDialogOpen,
    setAppInitialized, updateContextMenuState
} from "../state/Slice";
import {useAppDispatch, useAppSelector} from "../state/Hooks";
import {Alert, AlertTitle} from "@mui/material";
import ServerManagement from "./servers/ServerManagement";
import AddServer from "./servers/AddServer";
import Observables from "./observables/Observables";
import {initDb, readSensorHubServers} from "../database/database";
import {IObservable, ISensorHubServer} from "../data/Models";
import {fetchControls, fetchPhysicalSystems, fetchSubsystems} from "../net/SystemRequest";
import {getObservables} from "../observables/ObservableUtils";
import CenteredPopover from "./decorators/CenteredPopover";
import Systems from "./systems/Systems";
import FeatureOfInterests from "./featureOfInterest/FeatureOfInterests";
import StreamingDialog from "./dialogs/StreamingDialog";
import {ObservableType} from "../data/Constants";


// @ts-ignore
import DataStreams from "osh-js/source/core/sweapi/datastream/DataStreams.js";
// @ts-ignore
import FeatureOfInterest from "osh-js/source/core/sweapi/featureofinterest/FeatureOfInterest.js";
import {fetchFeatureOfInterests} from "../net/FeatureOfInterestRequest";
import STIMap from "./map/STIMap";
import {fetchFeatureOfInterestDatastreams} from "../net/DataStreamsFromFoiRequest";


export interface Station{
    features: typeof FeatureOfInterest;
    datastreams: typeof DataStreams;

}

const App = () => {
    const dispatch = useAppDispatch();

    let appInitialized = useAppSelector(selectAppInitialized);

    let [showSplashScreen, setShowSplashScreen] = useState<boolean>(true);

    let showSettingsDialog = useAppSelector(selectSettingsDialogOpen);
    let showServerManagementDialog = useAppSelector(selectServerManagementDialogOpen);
    let showObservablesDialog = useAppSelector(selectObservablesDialogOpen);
    let showAddServerDialog = useAppSelector(selectAddServerDialogOpen);
    let showSystemsDialog = useAppSelector(selectSystemsDialogOpen);
    let showFeaturesOfInterestDialog= useAppSelector(selectFeaturesOfInterestDialogOpen);

    let connectedObservables = useAppSelector(selectConnectedObservables);
    let observables = useAppSelector(selectObservables);

    let [showConfirmation, setShowConfirmation] = useState<boolean>(false);
    let [showError, setShowError] = useState<boolean>(false);
    let [errorMsg, setErrorMsg] = useState<string>(null);


    useEffect(() => {

        const loader = async () => {

            await initDb();

            dispatch(updateContextMenuState({ showMenu: true, top: 0, left: 0 }));


            let sensorHubServers: ISensorHubServer[] = await readSensorHubServers();

            for (let sensorHubServer of sensorHubServers) {

                dispatch(addSensorHubServer(sensorHubServer));

                // await  fetchFeatureOfInterests(sensorHubServer, true).then(async samplingfeatures => {
                //     // for(let foi of fois) {
                //     //     dispatch(addFeatureOfInterests(foi));
                //     // }
                //
                //     const allFoiCol = await samplingfeatures.searchFeaturesOfInterest(undefined, 999999);
                //     const allFoi = await allFoiCol.nextPage();
                //
                //
                //     for (let index= 0; index < 2500; index++) {
                //         console.log('foi', allFoi[index])
                //         await fetchFeatureOfInterestDatastreams(sensorHubServer, true, allFoi[index]).then(foiDataStreams =>{
                //             dispatch(addFeatureOfInterestDatastreams({foi: allFoi[index], datastreams: foiDataStreams}));
                //         });
                //     }
                // }).catch(() => popupError(sensorHubServer.name));
                // await fetchFeatureOfInterest(sensorHubServer, true).then(async fois =>{
                //     for(let foi of fois){
                //         dispatch(addFeatureOfInterests(foi));
                //     }
                //
                // }).catch(() => popupError(sensorHubServer.name));


                await fetchPhysicalSystems(sensorHubServer, true).then(async physicalSystems => {

                    for (let system of physicalSystems) {

                        await fetchControls(sensorHubServer, true, system).then();

                        await fetchSubsystems(sensorHubServer, true, system).then(async physicalSystems =>{

                            for (let system of physicalSystems) {

                                dispatch(addPhysicalSystem(system))
                            }
                        });

                        dispatch(addPhysicalSystem(system))
                    }

                    await getObservables(sensorHubServer, true).then(visualizations => {

                        for (let visualization of visualizations) {

                            dispatch(addObservable(visualization))
                        }

                    }).catch(() => popupError(sensorHubServer.name));

                }).catch(() => popupError(sensorHubServer.name));
            }
        }

        if (!appInitialized) {

            loader().then(() => {
                    if (!showError) {
                        dispatch(setAppInitialized(true));


                        setShowConfirmation(true);
                        setTimeout(() => {
                            setShowConfirmation(false);
                        }, 5000)
                    }
                }
            );
        }
    }, [])

    let videoDialogs: any[] = [];

    let connectedObservablesArr: IObservable[] = [];
    connectedObservables.forEach((connected: boolean, id: string) => {

        if (connected) {

            let observable: IObservable = observables.get(id);

            if (observable.type === ObservableType.DRAPING || observable.type === ObservableType.VIDEO) {

                connectedObservablesArr.push(observable);
            }
        }
    })

    connectedObservablesArr.forEach((observable: IObservable) => {

        videoDialogs.push(<StreamingDialog key={observable.uuid} observable={observable}/>);
    })

    const popupError = (msg: string) => {

        setErrorMsg(msg);
        setShowError(true);
        setTimeout(() => {
            setErrorMsg(null);
            setShowError(false);
        }, 5000)
    }



    return (
        <div>

            <ContextMenu/>


            {showServerManagementDialog ? <ServerManagement title={"Servers"}/> : null}
            {showSettingsDialog ? <Settings title={"Settings"}/> : null}
            {showAddServerDialog ? <AddServer title={"Configure New Server"}/> : null}
            {showObservablesDialog ? <Observables title={"Observables"}/> : null}
            {showSystemsDialog ? <Systems title={"Systems"}/> : null}
            {showFeaturesOfInterestDialog ? <FeatureOfInterests title={"Features of Interest"}/> : null}
            {/*<ServerManagement title={"Servers"} />*/}
            {/*<Settings title={"Settings"} />*/}
            {/*<AddServer title={"Configure New Server"} />*/}
            {/*<Observables title={"Observables"} />*/}
            {/*<Systems title={"Systems"} />*/}
            {/*<FeatureOfInterests title={"Features of Interest"} />*/}
            {/*<SplashScreen onEnded={() => setShowSplashScreen(false)} />*/}


            {/*<LeafletMap stationArray={null}/>*/}

            <STIMap/>

            {showConfirmation ?
                <CenteredPopover anchorEl={document.getElementById('root')}>
                    <Alert severity="success">
                        <AlertTitle>Initialization Complete!</AlertTitle>
                    </Alert>
                </CenteredPopover>
                : null
            }

            {showError ?
                <CenteredPopover anchorEl={document.getElementById('root')}>
                    <Alert severity="warning">
                        <AlertTitle>{errorMsg} : Invalid Server Configuration or Server Not Responding</AlertTitle>
                    </Alert>
                </CenteredPopover>
                : null
            }
        </div>
    );
};

export default App;
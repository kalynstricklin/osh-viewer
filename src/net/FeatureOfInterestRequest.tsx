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

import {
    IFeatureOfInterest,
    ISensorHubServer, FeatureOfInterest,
} from "../data/Models";
import {Service} from "../data/Constants";
import {fetchFromObject} from "../utils/Utils";

export async function fetchFeatureOfInterest(server: ISensorHubServer, withCredentials: boolean){

    let request: string = server.address + Service.API + '/samplingFeatures?f=application/json&validTime=../..';

    let options: RequestInit = {};
    options.method = "GET";
    if (withCredentials) {

        options.credentials = "include";
        options.headers = new Headers({
            "Authorization": "Basic " + server.authToken,
            "Content-Type": "application/json",
        });
    }
    options.mode = "cors";

    let response = await fetch(request, options).catch(reason => {
        console.error("Feature of Interest request failed on:", server.name);
        throw new Error(reason);
    });

    return await response.json().then(
        data =>{
            let featureOfInterests: IFeatureOfInterest[] = [];


            let foiData: any[] = fetchFromObject(data, "items");

            console.log('foi data', foiData);

            for(let foi of foiData){
                console.log('foi', foi)
                let foiId = foi.id;
                let uid = foi.properties.uid;
                let name = foi.properties.name;
                let geometry = foi.geometry;


                let featureOfInterest: IFeatureOfInterest = new FeatureOfInterest({
                    name: name,
                    serverUid: uid,
                    foiId: foiId,
                    uuid: uid,
                    geometry: geometry,
                    server: server,
                    parentSystemUuid: null
                });

                server.foi.push(featureOfInterest);
                featureOfInterests.push(featureOfInterest);

            }
            console.log('feature of interests', featureOfInterests);
            return featureOfInterests;
        });
}

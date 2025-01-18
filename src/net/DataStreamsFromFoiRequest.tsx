import { Service } from "../data/Constants";
import {ISensorHubServer} from "../data/Models";

// @ts-ignore
import DataStreamFilter from "osh-js/source/core/sweapi/datastream/DataStreamFilter.js";
// @ts-ignore
import DataStreams from "osh-js/source/core/sweapi/datastream/DataStreams.js";
import {addFeatureOfInterestDatastreams} from "../state/Slice";

export async function fetchFeatureOfInterestDatastreams(server: ISensorHubServer, withCredentials: boolean, foi: any){

    let request: string = server.address + Service.API;
    let parseUrl = request.split("//")[1];
    let networkOpts = {
        endpointUrl: parseUrl,
        tls: false,
        connectorOpts: {
            username: 'admin',
            password: 'admin',
        }
    }

    const datastreams = new DataStreams(networkOpts);


    const dsCol = await datastreams.searchDataStreams(new DataStreamFilter({foi: foi.properties.id}), 999999);
    const ds = await dsCol.nextPage();
    return ds;


    // let request: string = server.address + Service.API +'/datastreams?f=application/json&validTime=../..';

    // let options: RequestInit = {};
    // options.method = "GET";
    // if (withCredentials) {
    //
    //     options.credentials = "include";
    //     options.headers = new Headers({
    //         "Authorization": "Basic " + server.authToken,
    //         "Content-Type": "application/json",
    //     });
    // }
    // options.mode = "cors";
    //
    // let response = await fetch(request,options).catch(reason => {
    //     console.error("Datastreams request failed on:" + server.name);
    //     throw new Error(reason);
    // })

    // const data = await response.json();

    // let datastreams: DataStreams = fetchFromObject(data, "items");

    // console.log('dsCol', datastreams.searchDataStreams());

    // const dsCol = await response.searchDataStreams(new DataStreamFilter({foi: foi.foiId}), 99999);

    // const dsCol = await datastreams.searchDataStreams(new DataStreamFilter({foi: foi.foiId}), 99999);
    // const ds = await dsCol.nextPage();
    //
    // console.log('ds', ds, 'foi', foi)

    // return {ds}

    // // console.log("datastream fetch response", response)
    // return await response.json().then(
    //     data =>{
    //
    //
    //         // for(let datastream of datastreams){
    //         //
    //         //     // console.log("datastream", datastream)
    //         //
    //         //     featureOfInterestData.push(datastream, foi);
    //         // }
    //         //
    //         // // console.log('features of interest data', featureOfInterestData)
    //         // return featureOfInterestData;
    //
    //     }
    // )

}


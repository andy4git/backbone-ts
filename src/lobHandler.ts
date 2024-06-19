import axios from "axios";
import {IBackboneHandler, ILatency} from "./baseTypes";
import {BackboneContext, LatencyRecord} from "./baseTypes";
import {WrappedRequest} from "./baseTypes";
import { OAGError } from "./errors";

export class LobHandler implements IBackboneHandler, ILatency {

    startTime: number ;

    filteredHttpHeaders : string[] = ['authorization','x-api-key'];

    constructor() {
        this.startTime = Date.now();
    }


    public async process(backboneContext: BackboneContext) {
        
       const wrappedRequest = backboneContext.wrappedRequest;
       let endpoint: string = wrappedRequest.stageVariables.get('lobEndpoint') ?? '';
       try {

         // resolve path parameters
         let path: string = wrappedRequest.context.get('resource-path') ?? '';
         if ( wrappedRequest.params.path.size > 0 ) {
             wrappedRequest.params.path.forEach((value: string, key: string) => {
                 path = path.replace(`{${key}}`, value);
             });
             endpoint = endpoint + path;
         }

         // resolve query parameters
         if( wrappedRequest.params.querystring.size > 0 ) {
                let queryString: string = '';
                wrappedRequest.params.querystring.forEach((value: string, key: string) => {
                    queryString = queryString + `${key}=${value}&`;
                });

                queryString = queryString.slice(0, queryString.length - 1 );
                endpoint = endpoint + '?' + queryString;
         }

         let headers: Record<string, string> = {};
         if( wrappedRequest.params.header.size > 0 ) {
             wrappedRequest.params.header.forEach((value: string, key: string) => {
               if( !this.filteredHttpHeaders.includes(key.toLocaleLowerCase()) ) {
                 headers[key] = value;
               }
             });
         }
 

         let httpMethod: string = wrappedRequest.context.get('http-method') ?? '';
         if( httpMethod === 'GET' ) {   
            const lobResponse = await axios.get(endpoint, {headers});
            backboneContext.lobResponse = lobResponse;
         }
         else if( httpMethod === 'POST' ) {
            const lobResponse = await axios.post(endpoint, wrappedRequest.body, {headers});
            backboneContext.lobResponse = lobResponse;
         }
         else if( httpMethod === 'PUT' ) {
            const lobResponse = await axios.put(endpoint, wrappedRequest.body, {headers});
            backboneContext.lobResponse = lobResponse;
         }
         this.recordLatency(backboneContext);
       }
       catch(error) {
         this.recordLatency(backboneContext);
         console.log(`LobHandler: Error occurred while processing the request: ${error}`);
         throw new OAGError('LobHandler: Error occurred while calling backend', 'SYS01', 500);
       }
    }

    public recordLatency(backboneContext: BackboneContext): void {
        let latency: number = Date.now() - this.startTime;
        let latencyRecord: LatencyRecord = new LatencyRecord(this.startTime, latency, 'LobHandler');
        backboneContext.latencyRecords.push(latencyRecord);         
    }
}


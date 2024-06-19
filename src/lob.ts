import axios from "axios";
import { IBackboneHandler, ILatency } from "./baseTypes";
import { BackboneContext, LatencyRecord } from "./baseTypes";
import { WrappedRequest } from "./baseTypes";
import { OAGError } from "./errors";

export class LobHandler implements IBackboneHandler, ILatency {

  startTime: number;

  filteredHttpHeaders: string[] = ['authorization', 'x-api-key', 'host'];

  constructor() {
    this.startTime = Date.now();
  }

  public async process(backboneContext: BackboneContext) {

    const wrappedRequest: WrappedRequest = backboneContext.wrappedRequest;
    let endpoint: string = wrappedRequest.stageVariables['lobEndpoint'];

    // resolve path parameters
    let path: string = wrappedRequest.context['resource-path'];
    let pathParams: Record<string, string> = wrappedRequest.params.path;
    if (Object.keys(pathParams).length > 0) {
      Object.entries(pathParams).forEach(([key, value]) => {
        path = path.replace(`{${key}}`, value);
      });
    }
    endpoint = endpoint + path;

    // resolve query parameters
    let queryStrings: Record<string, string> = wrappedRequest.params.querystring;
    if (Object.keys(queryStrings).length > 0) {
      let queryString: string = '';
      Object.entries(queryStrings).forEach(([key, value]) => {
        queryString = queryString + `${key}=${value}&`;
      });
      queryString = queryString.slice(0, queryString.length - 1);
      endpoint = endpoint + '?' + queryString;
    }

    let headers: Record<string, string> = {};
    let headerParams: Record<string, string> = wrappedRequest.params.header;
    if (Object.keys(headerParams).length > 0) {
      Object.entries(headerParams).forEach(([key, value]) => {
        if (!this.filteredHttpHeaders.includes(key.toLocaleLowerCase())) {
          headers[key] = value;
        }
      });
    }

    const axiosConfig = {
      headers,
      validateStatus: function (status: any) {
        return true; 
      },
    };

    try {
      let httpMethod: string = wrappedRequest.context['http-method'] ?? '';
      if (httpMethod === 'GET') {
        const lobResponse = await axios.get(endpoint, axiosConfig );
        backboneContext.lobResponse = lobResponse;
      }
      else if (httpMethod === 'POST') {
        const lobResponse = await axios.post(endpoint, wrappedRequest.body, axiosConfig);
        backboneContext.lobResponse = lobResponse;
      }
      else if (httpMethod === 'PUT') {
        const lobResponse = await axios.put(endpoint, wrappedRequest.body, axiosConfig );
        backboneContext.lobResponse = lobResponse;
      }
      this.recordLatency(backboneContext);
    }
    catch (error) {
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

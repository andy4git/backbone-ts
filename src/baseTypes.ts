import { AxiosResponse } from "axios";

export class BackboneSetting { 
   public fmblEndPoint: string = "";
}

export class APISetup {
   public apiName: string = "";
   public requiredScope: string = "";
   public requiredProfile: string = "";
   public auditRequired : boolean = false;
   public ignoreAuditFailure : boolean = false;
}

export class WrappedRequest {

   public body: any;

   public params: RequestParams = new RequestParams();

   public stageVariables: Map<string, string> = new Map<string, string>();

   public context:Map<string,string> = new Map<string,string>();  

}


export class RequestParams {
   
   public path: Map<string, string> = new Map<string, string>();

   public querystring: Map<string, string> = new Map<string, string>();

   public header: Map<string, string> = new Map<string, string>();
}


export class BackboneContext {

   public apiSetup: APISetup ;
   public backboneSetting: BackboneSetting;
   public wrappedRequest: WrappedRequest ;
   public latencyRecords: LatencyRecord[]; 
   public lobResponse: AxiosResponse<any, any> | null = null;

   constructor(apiSetup: APISetup, backboneSetting: BackboneSetting, wrappedRequest: WrappedRequest) {
      this.apiSetup = apiSetup;
      this.backboneSetting = backboneSetting;
      this.wrappedRequest = wrappedRequest;
      this.latencyRecords = [];
   }
}

export class LatencyRecord {
   public start: number;
   public latency: number;
   public actionName: string;

   constructor(start: number, latency: number, actionName: string) {
      this.start = start;
      this.latency = latency;
      this.actionName = actionName;
   }
}

export interface ILatency{
   recordLatency(backboneContext: BackboneContext): void;
}

export interface IBackboneHandler {
   process( backboneContext: BackboneContext ) : void;
}

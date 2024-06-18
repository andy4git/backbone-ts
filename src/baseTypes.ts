export class BackboneSetting { 
   public fmblEndPoint: String = "";
}

export class APISetup {
   public apiName: String = "";
   public requiredScope: String = "";
   public requiredProfile: String = "";
   public auditRequired : boolean = false;
   public ignoreAuditFailure : boolean = false;
}

export class WrappedRequest {

   public body: any;

   public params: RequestParams = new RequestParams();

   public stageVariables: Map<String, String> = new Map<String, String>();

   public context:Map<String,String> = new Map<String,String>();  

}


export class RequestParams {
   
   public path: Map<String, String> = new Map<String, String>();

   public querystring: Map<String, String> = new Map<String, String>();

   public header: Map<String, String> = new Map<String, String>();
}


export class BackboneContext {

   public apiSetup: APISetup ;
   public backboneSetting: BackboneSetting;
   public wrappedRequest: WrappedRequest ;
   public latencyRecords: LatencyRecord[]; 

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
   recordLatency(start: number, latency: number, action: String, BackboneContext: BackboneContext): void;
}
export class BackboneSetting { 
   fmblEndPoint: String = "";
}


export class APISetup {
   apiName: String = "";
   requiredScope: String = "";
   requiredProfile: String = "";
   auditRequired : boolean = false;
   ignoreAuditFailure : boolean = false;
}

export class WrappedRequest {

   body: any;

   params: RequestParams = new RequestParams();

   stageVariables: Map<String, String> = new Map<String, String>();

   context:Map<String,String> = new Map<String,String>();  

}


export class RequestParams {
   
   path: Map<String, String> = new Map<String, String>();

   querystring: Map<String, String> = new Map<String, String>();

   header: Map<String, String> = new Map<String, String>();
}


export class BackboneContext {

   apiSetup: APISetup ;
   backboneSetting: BackboneSetting;
   wrappedRequest: WrappedRequest ;

   constructor(apiSetup: APISetup, backboneSetting: BackboneSetting, wrappedRequest: WrappedRequest) {
      this.apiSetup = apiSetup;
      this.backboneSetting = backboneSetting;
      this.wrappedRequest = wrappedRequest;
   }
}
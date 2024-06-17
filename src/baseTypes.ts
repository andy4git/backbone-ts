export class BackboneContext { 

   fmblEndPoint: String = "";



}


export class APISetup {

   apiName: String = "";

   apiVersion: String = "";
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
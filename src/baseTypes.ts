export class BackboneContext { 



}

export class ApiContext {

   public path : String = "";
   public method : String = "";
   public lobEndpoint: String = "";
   public clientHeaders : Map<String, String> = new Map<String, String>();
   public clientParams  : Map<String, String> = new Map<String, String>();
   
   public auditEnabled: boolean = false;
   public ignoreAuditFailure : boolean = false;
   public lobTokenRequired : boolean = false;

   public requiredScope: String = "";
   public requiredProfile: String = "";

}
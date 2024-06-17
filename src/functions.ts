import { Request, Response } from 'express';
import { APISetup } from './baseTypes';





export function extractAPISetting(request: Request) : APISetup {

  let apiSetup: APISetup = new APISetup();
  apiSetup.apiName = request.header('apiName') || "";
  apiSetup.requiredScope = request.header('requiredScope') || "";
  apiSetup.requiredProfile = request.header('requiredProfile') || "";
  apiSetup.auditRequired = request.header('auditRequired') === 'true' ? true : false;
  apiSetup.ignoreAuditFailure = request.header('ignoreAuditFailure') === 'true' ? true : false;
  return apiSetup;
}
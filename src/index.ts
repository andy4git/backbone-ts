import cluster, { Worker } from 'cluster';
import os from 'os';
import express from 'express';
import e, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { WrappedRequest, RequestParams, BackboneSetting, BackboneContext, APISetup } from './baseTypes';
import { handleDummyBackend } from './dummy';
import { LobHandler } from './lob';
import { OAGError } from './errors';
import { Validator } from './validater';
import { AuditHandler } from './audit';


// if (cluster.isPrimary) {
//   // Step 2: In the master process, fork worker processes for each CPU core
//   const numCPUs = os.cpus().length;
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork();
//   }

//   cluster.on('exit', (worker : Worker) => {
//     console.log(`Worker ${worker.process.pid} died`);
//     cluster.fork();
//   });
// } 
// else { 


  const app = express();
  const backboneSetting : BackboneSetting = getBackBoneSetting();

  app.use(cors());
  app.use(bodyParser.json());
  app.post('/backbone', (request: Request, response: Response ) => {
    handleRequest(request, response, backboneSetting);
  });
  
  // Wildcard route to handle any other path with default logic
  app.all('*', (request: Request, response: Response) => {
     handleDummyBackend(request, response);
  });

  app.listen(3000, () => {
    console.log(`Server is running on port 3000 with worker ${process.pid}`);
  });

//}

async function handleRequest(request: Request, response: Response, backboneSetting: BackboneSetting ) {

  const backboneContext: BackboneContext = deriveBackboneContext(request, backboneSetting);
  
  logRequest(request);

  try {
      
      new Validator().process(backboneContext);

      const lobHandler = new LobHandler();
      await lobHandler.process(backboneContext);

      const auditHandler = new AuditHandler();
      await auditHandler.process(backboneContext);
      
      sendBackResponse(response, backboneContext);
  }
  catch(error) {
    console.log(`Error occurred while processing the request: ${error}`);
    if( error instanceof OAGError ) {
      let errorMsg = {
        errorCode: error.errorCode,
        message: error.message
      }
      response.status(error.httpCode).send(errorMsg);
    }
    else {
      let errorMsg = {
        errorCode: 'SYS02',
        message: 'Internal server error'
      }
      response.status(500).send(errorMsg);      
    }
  }

  console.log(backboneContext.latencyRecords);

}

function getBackBoneSetting(): BackboneSetting {
  let backboneSetting: BackboneSetting = new BackboneSetting();
  backboneSetting.fmblEndPoint = "https://fmbl.com";
  return backboneSetting;
}

function deriveBackboneContext(request: Request, backboneSetting: BackboneSetting): BackboneContext {

  let apiSetup : APISetup = new APISetup();
  apiSetup.apiName = request.get('x-oag-apiname') || "";
  apiSetup.requiredScope = request.get('x-oag-scope') || "";
  apiSetup.auditRequired = request.get('x-oag-audit-enabled') === 'true' ? true : false;
  apiSetup.ignoreAuditFailure = request.get('x-oag-audit-ignore-failure	') === 'true' ? true : false;
  
  let wrappedRequest: WrappedRequest = request.body;
  let backboneContext: BackboneContext = new BackboneContext(apiSetup, backboneSetting, wrappedRequest);

  return backboneContext
}

function sendBackResponse(response: Response, backboneContext: BackboneContext) {

  const lobResponse = backboneContext.lobResponse;
  if( lobResponse ==undefined || lobResponse == null ) {
     throw new OAGError('Invalid lob resposne', 'SYS01', 500);
  }

  let statusCode = lobResponse.status;
  let responseHeaders = lobResponse.headers;
  let responseBody = lobResponse.data;

  Object.keys(responseHeaders).forEach((key) => {
     response.setHeader(key, responseHeaders[key]);
  });

  response.status(statusCode).send(responseBody);
}

function logRequest(request:Request) {
  console.log(`Incoming Request: ${request.method} ${request.url}`);
  console.log(`Headers: ${JSON.stringify(request.headers)}`);
  console.log(`Query: ${JSON.stringify(request.query)}`);
  console.log(`Body: ${JSON.stringify(request.body)}`);  
}
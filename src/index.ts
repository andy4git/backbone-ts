import cluster, { Worker } from 'cluster';
import os from 'os';
import express from 'express';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { WrappedRequest, RequestParams, BackboneSetting, BackboneContext, APISetup } from './baseTypes';



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

  app.listen(3000, () => {
    console.log(`Server is running on port 3000 with worker ${process.pid}`);
  });

//}

function handleRequest(request: Request, response: Response, backboneSetting: BackboneSetting ) {

  logIncomingRequest(request);
  

  const backboneContext: BackboneContext = deriveBackboneContext(request, backboneSetting);
  response.type('application/json');
  response.setHeader('Powered-By', 'NodeJS/Typescript');
  response.status(200).send(backboneContext.wrappedRequest);

}

function getBackBoneSetting(): BackboneSetting {
  let backboneSetting: BackboneSetting = new BackboneSetting();
  backboneSetting.fmblEndPoint = "https://fmbl.com";
  return backboneSetting;
}

function deriveBackboneContext(request: Request, backboneSetting: BackboneSetting): BackboneContext {

  let apiSetup : APISetup = new APISetup();
  let wrappedRequest: WrappedRequest = request.body;
  let backboneContext: BackboneContext = new BackboneContext(apiSetup, backboneSetting, wrappedRequest);

  return backboneContext
}

function logIncomingRequest(request: Request) {
  console.log(`Incoming Request: ${request.method} ${request.url}`);
  console.log(`Headers: ${JSON.stringify(request.headers)}`);
  console.log(`Query: ${JSON.stringify(request.query)}`);
  console.log(`Body: ${JSON.stringify(request.body)}`);
}


// import axios from 'axios';

// interface MyRequestBody {
//   knownProperty: string;
//   unknownProperty: any;
// }

// app.post('/backbone', async (request: Request, response: Response ) => {
//   const body: MyRequestBody = request.body;
  
//   // Process knownProperty
//   console.log(body.knownProperty);

//   // Send unknownProperty as the body of another POST request
//   try {
//     const res = await axios.post('http://example.com/endpoint', body.unknownProperty);
//     console.log(res.data);
//   } catch (error) {
//     console.error(error);
//   }
// });
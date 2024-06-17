import cluster, { Worker } from 'cluster';
import os from 'os';
import express from 'express';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { WrappedRequest, RequestParams, BackboneContext } from './baseTypes';



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
  const backboneContext : BackboneContext = deriveBackboneContext();

  app.use(cors());
  app.use(bodyParser.json());
  app.post('/backbone', (request: Request, response: Response ) => {
    handleRequest(request, response, backboneContext);
  });

  app.listen(3000, () => {
    console.log(`Server is running on port 3000 with worker ${process.pid}`);
  });

//}


function deriveBackboneContext(): BackboneContext {
  const backboneContext: BackboneContext = new BackboneContext();
  return backboneContext;
}

function handleRequest(request: Request, response: Response, backboneContext: BackboneContext  ) {

  const wrappedRequest: WrappedRequest = request.body;

  response.type('application/json');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Powered-By', 'NodeJS/Typescript');
  response.status(200).send(wrappedRequest);

}

function deriveApiContext(request: Request): WrappedRequest {

  let wrappedRequest: WrappedRequest = request.body;
  


  return wrappedRequest;
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
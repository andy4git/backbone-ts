import cluster, { Worker } from 'cluster';
import os from 'os';
import express from 'express';
import { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { ApiContext, BackboneContext } from './baseTypes';



if (cluster.isPrimary) {
  // Step 2: In the master process, fork worker processes for each CPU core
  const numCPUs = os.cpus().length;
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker : Worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} 
else { 

  const app = express();

  app.use(cors());
  app.use(bodyParser.json());

  app.get('/', (request: Request, response: Response ) => {
    response.send('Hello World!');
  });

  app.listen(3000, () => {
    console.log(`Server is running on port 3000 with worker ${process.pid}`);
  });
}
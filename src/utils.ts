import fs from 'fs';
import dotenv from 'dotenv';
import forge from 'node-forge';

import { Agent } from 'https';
import { BackboneContext,  APISetup, BackboneSetting, WrappedRequest  } from './baseTypes';
import { OAGError } from './errors';
import { Request, Response } from 'express';


export function getHttpsAgent(): Agent {

    dotenv.config();

    const keystorePath   = process.env.KEYSTORE_PATH || '';
    const truststorePath = process.env.TRUSTSTORE_PATH || '';
    const keystorePassphrase   = process.env.KEYSTORE_PASSPHRASE || '';
    const truststorePassphrase = process.env.TRUSTSTORE_PASSPHRASE || '';
    const validateServerCert : boolean = ( 'true' == ( process.env.VALIDATE_SERVER_CERT || '') );

    // Load and configure the keystore, the buffer type is required and accepted for the pfx option
    const keystorePfx = fs.readFileSync( keystorePath );

    // load truststore as pkcs12 object
    const truststorePfx = fs.readFileSync(truststorePath);
    const truststore = forge.pkcs12.pkcs12FromAsn1(
        forge.asn1.fromDer(truststorePfx.toString('binary')),
        truststorePassphrase
    );

    // Extract CA certificates from truststore and convert them to PEM format 
    // then add them to the string array as ca option of SecureContextOptions
    let caCerts: string[] = [];
    truststore.safeContents.forEach(safeContent => {
        safeContent.safeBags.forEach( safeBag => {
            if ( safeBag.cert ) {
                const pem = forge.pki.certificateToPem(safeBag.cert);
                caCerts.push(pem);
            }
        });
    });

    // Create an agent with the keystore and the extracted CA certificates, the keystore passphrase is required
    // also the rejectUnauthorized option is set to false to ignore the certificate validation
    const agent = new Agent({
        rejectUnauthorized: validateServerCert,
        pfx: keystorePfx,
        passphrase: keystorePassphrase,
        ca: caCerts, // Use the manually extracted CA certificates from truststore
      });


    return agent;
}


export function getSigningKey(): string {

    dotenv.config();

    const keystorePath   = process.env.KEYSTORE_PATH || '';
    const keystorePassphrase   = process.env.KEYSTORE_PASSPHRASE || '';

    const keystorePfx = fs.readFileSync(keystorePath);

    // Parse the PFX to get the private key
    const keystore = forge.pkcs12.pkcs12FromAsn1(
      forge.asn1.fromDer(keystorePfx.toString('binary')),
      keystorePassphrase
    );

    // Extract the private key from the keystore, encode it to PEM format
    let privateKey : string = '';
    keystore.safeContents.forEach((safeContent) => {
      safeContent.safeBags.forEach((safeBag) => {
        if (safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag) {     
          let keyObj = safeBag.key as forge.pki.PrivateKey;
          privateKey = forge.pki.privateKeyToPem( keyObj);
        }
      });
    });

    if( privateKey == '' ) {
        throw new Error('Private key not found in the keystore');
    }

    return privateKey; 
}

export function logRequest(request:Request) {
  log(`Incoming Request: ${request.method} ${request.url}`);
  log(`Headers: ${JSON.stringify(request.headers)}`);
  log(`Query: ${JSON.stringify(request.query)}`);
  log(`Body: ${JSON.stringify(request.body)}`);  
}


export function getBackBoneSetting(): BackboneSetting {
  let backboneSetting: BackboneSetting = new BackboneSetting();
  backboneSetting.fmblEndPoint = "https://fmbl.com";
  backboneSetting.httpsAgent = getHttpsAgent();
  backboneSetting.privateSigningKey = getSigningKey();
  return backboneSetting;
}

export function deriveBackboneContext(request: Request, backboneSetting: BackboneSetting): BackboneContext {

  let apiSetup : APISetup = new APISetup();
  apiSetup.apiName = request.header('x-oag-apiname') || "";
  apiSetup.requiredScope      = request.header('x-oag-scope') || "";
  apiSetup.requiredProfile    = request.header('x-oag-profile') || "";
  apiSetup.auditRequired      = request.header('x-oag-audit-enabled') === 'true' ? true : false;
  apiSetup.ignoreAuditFailure = request.header('x-oag-audit-ignore-failure') === 'true' ? true : false;
  apiSetup.signTokenRequired  = request.header('x-oag-sign-token-enabled') === 'true' ? true : false;
  
  let wrappedRequest: WrappedRequest = request.body;
  let backboneContext: BackboneContext = new BackboneContext(apiSetup, backboneSetting, wrappedRequest);

  return backboneContext
}

export function sendBackResponse(response: Response, backboneContext: BackboneContext) {

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

export function log(message: string) {
  const currentDateTime = new Date().toISOString();
  console.log(currentDateTime + ' ' + message);
}
import fs, { PathOrFileDescriptor } from 'fs';
import { Agent } from 'https';
import forge from 'node-forge';
import { BackboneContext } from './baseTypes';
import dotenv from 'dotenv';

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
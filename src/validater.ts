import {IBackboneHandler, ILatency} from "./baseTypes";
import {BackboneContext, LatencyRecord} from "./baseTypes";
import jwt  from 'jsonwebtoken';
import { JwtPayload } from "jsonwebtoken";
import { OAGError } from "./errors";


export class Validator implements IBackboneHandler, ILatency {

    public process(backboneContext: BackboneContext): void {

        let headerParams: Record<string, string> = backboneContext.wrappedRequest.params.header;
        let token: string = '';
        Object.entries(headerParams).forEach(([key, value]) => {
           if( 'authorization' == key.toLowerCase() ) {
               token = value;
           }
        });

        token = token.substring(7);
        const decodedToken : JwtPayload | null = jwt.decode(token, {json: true});
        if( decodedToken == null ) {
            throw new OAGError('Invalid token', 'ATH02', 401);
        }

        const requiredScope: string = backboneContext.apiSetup.requiredScope;
        const claimedScope: any = decodedToken.scope;
        this.validateClaim(requiredScope, claimedScope, 'Invalid scope, missing expected ' + requiredScope);

    }

    public recordLatency(backboneContext: BackboneContext): void {

    }

    validateClaim(expected: String, claim: any, message: string ) {

        let isValidClaim : boolean = false;
        if( typeof claim == 'string' ) {
           isValidClaim = ( expected == claim );
        }
        else if ( Array.isArray(claim) ) {
           isValidClaim = ( claim.includes(expected) );
        }

        if( !isValidClaim ) {
            throw new OAGError(message, 'ATH03', 401);
        } 
    }


}
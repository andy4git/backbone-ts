import {IBackboneHandler, ILatency} from "./baseTypes";
import {BackboneContext, LatencyRecord} from "./baseTypes";


export class tokenHandler implements IBackboneHandler, ILatency {

    public process(backboneContext: BackboneContext): void {

    }

    public recordLatency(backboneContext: BackboneContext): void {

    }
}

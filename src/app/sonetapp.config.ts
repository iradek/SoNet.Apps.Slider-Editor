import { Injectable } from "@angular/core";
import { SoNetConfigService } from "@iradek/sonet-appskit";

@Injectable({ providedIn: 'root' })
export class SoNetAppConfig extends SoNetConfigService {
    configFilePath = 'assets/sonet.config.json';
}
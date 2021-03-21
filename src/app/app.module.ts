import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AnimSelectorComponent } from './anim-selector/anim-selector.component';

import { AppComponent } from './app.component';
import { EditSliderItemComponent } from './edit-slider-item/edit-slider-item.component';
import { EditSlider } from './edit-slider/editSlider';

import { AccordionModule } from "primeng/accordion";
import { ToastModule } from "primeng/toast";
import { SliderModule } from 'primeng/slider';
import { MessageService, SharedModule } from 'primeng/api';
import { SoNetAppsKitModule, SoNetConfigService } from '@iradek/sonet-appskit';
import { SliderApiClient } from './services/sliderApiClient';
import { UtilsService } from './services/utils.service';
import { SoNetAppConfig } from './sonetapp.config';
import { FontPickerConfigInterface, FontPickerModule, FONT_PICKER_CONFIG } from 'ngx-font-picker';
import { environment } from 'src/environments/environment';

const DEFAULT_FONT_PICKER_CONFIG: FontPickerConfigInterface = {
  // Change this to your Google API key
  apiKey: environment.apiKey
};

@NgModule({
  declarations: [AppComponent, EditSlider, EditSliderItemComponent, AnimSelectorComponent],
  imports: [
    BrowserModule,    
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    SoNetAppsKitModule, 
    SharedModule,       
    AccordionModule,    
    ToastModule,
    SliderModule,
    FontPickerModule    
  ],
  providers: [SliderApiClient, UtilsService, MessageService,
    {
      provide: SoNetConfigService,
      useClass: SoNetAppConfig
    },
    {
      provide: FONT_PICKER_CONFIG,
      useValue: DEFAULT_FONT_PICKER_CONFIG
    }
  ],
  bootstrap: [AppComponent]
})
export class SliderEditorAppModule { }

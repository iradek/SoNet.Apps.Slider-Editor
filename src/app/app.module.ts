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
import { SoNetAppsKitModule } from '@iradek/sonet-appskit';
import { SliderApiClient } from './services/sliderApiClient';
import { UtilsService } from './services/utils.service';

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
    SliderModule    
  ],
  providers: [SliderApiClient, UtilsService, MessageService],
  bootstrap: [AppComponent]
})
export class AppModule { }

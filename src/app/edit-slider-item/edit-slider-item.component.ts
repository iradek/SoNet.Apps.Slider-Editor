import { Component, OnInit, Output, EventEmitter, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { SliderItem } from "../models/sliderItem";
import { Slider } from "../models/slider";
import { SlideAnimations } from '../models/slideAnimation';
import { AnimSelectorComponent } from '../anim-selector/anim-selector.component';
import { SliderApiClient } from '../services/sliderApiClient';
import { SoNetUrlService } from "@iradek/sonet-appskit";
import { Font } from 'ngx-font-picker';

@Component({
    selector: 'sonet-edit-slider-item',
    templateUrl: './edit-slider-item.component.html',
    styleUrls: ['./edit-slider-item.component.css']
})
export class EditSliderItemComponent implements OnInit, OnDestroy {

    imagedata: any = "";
    videodata: any;
    /**
     * When true - video that was uploaded is still being encoded
     */
    videoIsProcessing: boolean = false;
    videoProcessingInterval: any;
    defaultOpacity: number = 0.2;
    defaultHeight: number = 300;
    editSliderItemForm?: FormGroup;
    additionalProperties = {
        uriSchema: "http://",
        opacityValue: (this.defaultOpacity * 100),
        get finalOpacity(): number {
            return this.opacityValue / 100;
        },
        set finalOpacity(value: number) {
            this.opacityValue = value * 100;
        }
    };

    fontFiles:{
        TagTitleFont?: Font;
        TagMessageFont?: Font;
        ButtonFont?: Font;
    };
    /**
     * When true - it contains an image or video that needs to be uploaded.
     */
    dirty: boolean = false;

    get opacityCSS(): string { return `;background-color: rgba(34,34,34, ${this.additionalProperties.finalOpacity});`; }; //must be a property to re-evaluate on each call
    opacityRegex: RegExp = new RegExp(";background-color:\\s+rgba\\(34,34,34,\\s+([0-9]*\\.?[0-9]+)\\);*", "i");
    prefixRegex: RegExp = new RegExp("^(http[s]*:\\/\\/|tel:)", "i");

    get overlayStyleControl() { return this.editSliderItemForm ? this.editSliderItemForm.get("OverlayStyle") : null; };
    get buttonUrlControl() { return this.editSliderItemForm ? this.editSliderItemForm.get("ButtonUrl") : null; };

    @ViewChild("imgContainer", { static: true }) imgContainer: ElementRef;

    @Input()
    set sliderItem(value: SliderItem) {
        this._sliderItem = value;
        this.buildForm();
        setTimeout(() => this.fillControlFromInstance(value)); //setTimeout - this.buttonUrlControl.setValue would not display the value immediately
    }

    private _sliderItem?: SliderItem;
    get sliderItem(): SliderItem {
        if (!this._sliderItem)
            this._sliderItem = new SliderItem();
        return this._sliderItem;
    }

    @Input()
    slider: Slider = new Slider();

    @Output()
    sliderChange = new EventEmitter<Slider>();

    get valid(): boolean {
        return this.imgSource != null || this.videoSource != null;
    }
    private _imgSource: string | null = null;
    get imgSource(): string | null {
        return this._imgSource ? this._imgSource : this.imagedata;
    }
    set imgSource(value: string | null) {
        this._imgSource = value;
    }

    private _videoSource: string | null = null;
    get videoSource(): string | null {
        return this._videoSource ? this._videoSource : this.videodata;
    }
    set videoSource(value: string | null) {
        this._videoSource = value;
    }

    @ViewChild(AnimSelectorComponent) animSelector?: AnimSelectorComponent;

    constructor(private formBuilder: FormBuilder, private sonetUrlService: SoNetUrlService, private apiClient: SliderApiClient) { }

    ngOnInit() {
        this.buildForm();
    }

    ngOnDestroy() {
        this.stopVideoProcessingInterval();
    }


    private startVideoProcessingInterval() {
        this.videoProcessingInterval = setInterval(async () => await this.checkVideoStatusAsync(this.sliderItem), 2000);
    }

    private stopVideoProcessingInterval() {
        if (this.videoProcessingInterval)
            clearInterval(this.videoProcessingInterval);
    }
    private styleValue(style: string): string[]{
      return style.split(";").filter(t=>t && t.indexOf("font")==-1);
    }
    private fontValue(style: string): string[]{
      return style.split(";").filter(t=>t && t.indexOf("font")!=-1);
    }
    private mapToFont(style: string): Font{
        var font = new Font({   //default
            family: 'Roboto',
            size: '14px',
            style: 'regular',
            styles: ['regular']
        });
        const parsed_font = this.fontValue(style).map(val=>{
            return {
              value: val.split(':')[1].trim(),
              prop: val.split(':')[0].replace('font-', '').replace('weight', 'style').trim()
            };
          });
          parsed_font.forEach(val=>{
            (<any>font)[val.prop] = val.value;  //TODO: not realy safe
          });
        return font;
    }


    buildForm(): void {
        this.editSliderItemForm = this.formBuilder.group({
            "TagTitle": [this.sliderItem.TagTitle, []],
            "TagMessage": [this.sliderItem.TagMessage, []],
            "ButtonText": [this.sliderItem.ButtonText, []],
            "ButtonUrl": [],
            "TagTitleStyle": [this.styleValue(this.sliderItem.TagTitleStyle), []],
            "TagMessageStyle": [this.styleValue(this.sliderItem.TagMessageStyle), []],
            "ButtonStyle": [this.styleValue(this.sliderItem.ButtonStyle), []],
            "OverlayStyle": [],
            // "TagTitleFont": [this.mapToFont(this.sliderItem.TagTitleStyle)],
            // "TagMessageFont": [this.mapToFont(this.sliderItem.TagMessageStyle)],
            // "ButtonTextFont": [this.mapToFont(this.sliderItem.ButtonStyle)],
            //"Muted": [this.sliderItem.Muted, []]
        });
        this.fontFiles = {
            TagTitleFont: this.mapToFont(this.sliderItem.TagTitleStyle),
            TagMessageFont: this.mapToFont(this.sliderItem.TagMessageStyle),
            ButtonFont: this.mapToFont(this.sliderItem.ButtonStyle)
        }
    }

    getSliderItemObject(): SliderItem {
        Object.assign(this.sliderItem, this.editSliderItemForm?.value);
        if (this.buttonUrlControl?.value)
            this.sliderItem.ButtonUrl = this.additionalProperties.uriSchema + this.buttonUrlControl.value;
        const additionalOverlayStyle: string = this.overlayStyleControl?.value || "";
        this.sliderItem.OverlayStyle = additionalOverlayStyle + this.opacityCSS;
        //pass back real cropped width
        this.sliderItem.Animation = this.animSelector?.selectedAnimation != null ? this.animSelector?.selectedAnimation.name : null;
    
        const fontStr = (font: any) => font? 
            Object.keys(font)
                .filter(prop => font[prop] != "undefined")
                .reduce((acc, str)=> acc += str + ":" + font[str] + ";", ";") 
            : "";
        console.log(this.fontFiles.TagTitleFont?.getStyles());
        console.log(fontStr(this.fontFiles.TagTitleFont?.getStyles()));
        this.sliderItem.TagTitleStyle = this.editSliderItemForm?.value["TagTitleStyle"] + fontStr(this.fontFiles.TagTitleFont?.getStyles());
        this.sliderItem.TagMessageStyle = this.editSliderItemForm?.value["TagMessageStyle"] + fontStr(this.fontFiles.TagMessageFont?.getStyles());
        this.sliderItem.ButtonStyle = this.editSliderItemForm?.value["ButtonStyle"] + fontStr(this.fontFiles.ButtonFont?.getStyles()); 
        this.sliderChange.emit(this.slider);
        return this.sliderItem;
    }

    fillControlFromInstance(instance: SliderItem) {
        if (!instance)
            return;
        if (instance.ImagePath)
            this.imgSource = this.sonetUrlService.resolveFinalUrl(instance.ImagePath);
        if (instance.VideoPath)
            this.videoSource = this.sonetUrlService.resolveFinalUrl(instance.VideoPath);
        if (instance.ButtonUrl && this.buttonUrlControl) {
            let match = instance.ButtonUrl.match(this.prefixRegex);
            if (match) {
                this.additionalProperties.uriSchema = match[1];
                this.buttonUrlControl!.setValue(instance.ButtonUrl.replace(this.additionalProperties.uriSchema, ""));
            }
            else
                this.buttonUrlControl.setValue(instance.ButtonUrl);
        }
        if (instance.OverlayStyle && this.overlayStyleControl) {
            let match = instance.OverlayStyle.match(this.opacityRegex);
            if (match)
                this.additionalProperties.finalOpacity = +match[1];                 //read the value
            this.overlayStyleControl.setValue(instance.OverlayStyle.replace(this.opacityRegex, "")); //and remove it from displaying
        }
        if(this.animSelector)
            this.animSelector.selectedAnimation = SlideAnimations.find(a => a.name == instance.Animation);
        this.dirty = false;

    }

    refreshAnimSelector() {
        if(this.animSelector)
            this.animSelector.sliderAnimations = SlideAnimations;
    }

    resetImage() {
        this.imgSource = null;
        if (this.imagedata)
            this.imagedata = null;
    }

    resetVideo() {
        this.videoSource = null;
        this.videodata = null;
        this.stopVideoProcessingInterval();
    }

    fileChangeListener($event: any) {
        let file: File = $event.target.files[0];
        let myReader: FileReader = new FileReader();
        let that = this;
        myReader.onloadend = function (loadEvent: any) {
            that.handleFileUpload(loadEvent.target.result, file);
            that.dirty = true;
        };
        myReader.readAsDataURL(file);
    }

    handleFileUpload(uploadResults: any, file: File) {
        if (!uploadResults || !file)
            return;
        setTimeout(() => { this.resetImage(); }, 100);
        setTimeout(() => { this.resetVideo(); }, 100);//wait for rendering tick (iOS)
        const isVideo = file.type && file.type.toLowerCase().startsWith("video/");
        if (isVideo) {
            setTimeout(() => this.videodata = uploadResults, 100);
            this.startVideoProcessingInterval();
        }
        else {
            setTimeout(() => this.imagedata = uploadResults, 100);
        }
    }

    private async checkVideoStatusAsync(sliderItem: SliderItem) {
        if (!sliderItem || this.apiClient.isEmpty(sliderItem.SliderItemID)) {
            return;
        }
        this.videoIsProcessing = await this.apiClient.isSliderVideoProcessing(sliderItem.SliderItemID);
    }
}

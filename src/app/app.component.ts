import { Component, ViewChild, ViewChildren, QueryList, ElementRef, OnChanges, Renderer2 } from "@angular/core";
import { SliderApiClient } from "./services/sliderApiClient";
import { EditSlider } from "./edit-slider/editSlider";
import { Slider } from "./models/slider";
import { SliderItem } from "./models/sliderItem";
import { EditSliderItemComponent } from "./edit-slider-item/edit-slider-item.component";
import { MessageService } from 'primeng/api';
import { SoNetAppConfig } from "./sonetapp.config";

declare var $: any;

@Component({
    selector: "sonet-sliderEditor",
    templateUrl: "./app.template.html"
})
export class AppComponent {

    @ViewChild("editSlider", { static: true }) editSliderControl: EditSlider;
    @ViewChild("slideEditor", { static: true }) slideEditor: ElementRef;
    @ViewChildren(EditSliderItemComponent) editSliderItemControls: QueryList<EditSliderItemComponent>;
    @ViewChildren("accordionHeader") accordionHeaders: QueryList<ElementRef>;
    maxUploadLengthInMegaBytes: number = 300;

    get currentSlider(): Slider {
        return this.editSliderControl.getSliderObject();
    }
    set currentSlider(value: Slider) {
        this.editSliderControl.slider = value;
    }

    get canSave(): boolean {
        return this.editSliderControl.valid;
    }

    constructor(private apiClient: SliderApiClient, private sonetConfig: SoNetAppConfig, private renderer: Renderer2, private messageService: MessageService) {
        if (this.sonetConfig.config?.maxUploadLengthInMegaBytes)
            this.maxUploadLengthInMegaBytes = this.sonetConfig.config.maxUploadLengthInMegaBytes;
    }

    async ngOnInit() {
        this.currentSlider = await this.apiClient.getCurrentSliderAsync();
        const btnSaveSlider = document.getElementById("btnSaveSlider")
        this.renderer.listen(btnSaveSlider, 'click', (e: Event) => {
            this.messageService.add({ severity: "info", summary: "Saving", detail: "Please wait..." });
            this.saveSlider().then(() => window.location.reload() /*reload to reflect changes on a Site */);
        });
    }

    async saveSlider() {
        if (!this.currentSlider)
            return;
        //save Slider
        let savedSlider = await this.apiClient.saveOrUpdateSliderAsync(this.currentSlider);
        this.currentSlider.SliderID = savedSlider.SliderID;

        //save Slider Items
        let index: number = 0;
        for (let editSliderControl of this.editSliderItemControls.toArray()) {
            if (!editSliderControl.valid)
                continue;
            let sliderItem = editSliderControl.getSliderItemObject();
            sliderItem.SliderID = savedSlider.SliderID;
            sliderItem.Order = index;
            let savedSliderItem = await this.apiClient.saveOrUpdateSliderItemAsync(sliderItem);
            let validSliderItemImageToUpload = editSliderControl.dirty && editSliderControl.imagedata;
            if (validSliderItemImageToUpload) {
                if (this.ensureFileSize(editSliderControl.imagedata.length, sliderItem))
                    savedSliderItem = await this.apiClient.uploadSliderItemImageAsync(savedSliderItem.SliderItemID, editSliderControl.imagedata);
                else
                    editSliderControl.resetImage();
            }
            let validSliderItemVideoToUpload = editSliderControl.dirty && editSliderControl.videodata;
            if (validSliderItemVideoToUpload) {
                if (this.ensureFileSize(editSliderControl.videodata.length, sliderItem))
                    savedSliderItem = await this.apiClient.uploadSliderItemVideoAsync(savedSliderItem.SliderItemID, editSliderControl.videodata);
                else
                    editSliderControl.resetVideo();
            }
            editSliderControl.sliderItem = savedSliderItem; //let it know so it can update instead of creating a new one
            this.currentSlider.SliderItemList[index] = savedSliderItem; //keep currentSlider.SliderItemList up to date as well (e.g. currentSlider.SliderItemList[index].SliderItemID is important for deleting later).
            index++;
        }
        //associate with a Site
        let currentSite = await this.apiClient.getSiteAsync();
        if (!currentSite)
            throw new Error("Current Site is null which is not supported while saving a Slider.");
        await this.apiClient.saveSliderForSiteAsync(currentSite.SiteName, savedSlider.SliderID);
        this.messageService.add({ severity: "success", summary: "Success", detail: "Slider saved sucessfully. Refreshing the page..." });
    }

    private isFileSizeOk(sizeInBytes: number, maxSizeInMegaBytes: number): boolean {
        if ((sizeInBytes || 0) <= 0 || (maxSizeInMegaBytes || 0) <= 0)
            return true;
        const sizeInMegaBytes = sizeInBytes / 1024 / 1024;
        return sizeInMegaBytes <= maxSizeInMegaBytes;
    }

    private ensureFileSize(sizeInBytes: number, sliderItem: SliderItem) {
        const isFileSizeOk = this.isFileSizeOk(sizeInBytes, this.maxUploadLengthInMegaBytes);
        if (!isFileSizeOk)
            alert(`Your file for slider #${(sliderItem.Order || 0) + 1} exceeds maximum allowed file size. Please pick a smaller file.`);
        return isFileSizeOk;
    }

    async deleteSliderItem(index: number) {
        const deletedSliderItems = this.currentSlider.SliderItemList.splice(index, 1);
        const sliderItemID = deletedSliderItems[0].SliderItemID;
        if (sliderItemID && !this.apiClient.isEmpty(sliderItemID))
            await this.apiClient.deleteSliderItemAsync(sliderItemID);
    }

    addNewSliderItem() {
        let newSliderItem = new SliderItem();
        if (!this.currentSlider.SliderItemList)
            this.currentSlider.SliderItemList = [];
        if (this.currentSlider.SliderItemList.length > 0) {
            //copy styles from last slider item
            const lastSliderItem = this.currentSlider.SliderItemList[this.currentSlider.SliderItemList.length - 1];
            if (lastSliderItem.TagTitleStyle)
                newSliderItem.TagTitleStyle = lastSliderItem.TagTitleStyle;
            if (lastSliderItem.TagMessageStyle)
                newSliderItem.TagMessageStyle = lastSliderItem.TagMessageStyle;
            if (lastSliderItem.ButtonStyle)
                newSliderItem.ButtonStyle = lastSliderItem.ButtonStyle;
            if (lastSliderItem.OverlayStyle)
                newSliderItem.OverlayStyle = lastSliderItem.OverlayStyle;
            if (lastSliderItem.SlideIndicatorStyle)
                newSliderItem.SlideIndicatorStyle = lastSliderItem.SlideIndicatorStyle;
        }
        this.currentSlider.SliderItemList.push(newSliderItem);
        setTimeout(() => this.accordionHeaders.last.nativeElement.click(), 100);//wait for rendering tick
    }

    trackSliderItem(index: number, sliderItem: SliderItem) {
        if (!sliderItem)
            return;
        return sliderItem.SliderItemID;
    }

}

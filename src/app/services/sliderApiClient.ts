import { Injectable } from "@angular/core";
import { Slider } from "../models/slider";
import { SliderItem } from "../models/sliderItem";
import { UtilsService } from "./utils.service";
import { SoNetApiClient, SoNetConfigService, SoNetProxy } from "@iradek/sonet-appskit";
import { Rectangle } from "../models/rectangle";

@Injectable()
export class SliderApiClient extends SoNetApiClient {

    constructor(protected soNetProxy: SoNetProxy, private utilsService: UtilsService, private sonetConfigService: SoNetConfigService) {
        super(soNetProxy, sonetConfigService);
    }

    async getCurrentSliderAsync(): Promise<Slider> {
        return await this.soNetProxy.get$<Slider>(`/api/SliderObjects/GetCurrent?excludeTemplateSlider=false&excludeDefaultSlider=true`).toPromise();
    }

    async getSliderAsync(sliderID: string): Promise<Slider> {
        if (!sliderID)
            throw new Error("Invalid sliderID");
        return await this.soNetProxy.get$<Slider>(`/odata/Sliders(${sliderID})?$expand=SliderItemList`).toPromise();
    }

    async saveSliderAsync(slider: Slider): Promise<Slider> {
        if (!slider)
            throw new Error("Invalid Slider to save.");
        const clonedSlider = this.ensureProperties({ ...slider }); //clone to save original with its SliderItemList that is normally deleted after
        delete clonedSlider.SliderItemList;
        return await this.soNetProxy.post$<Slider>("/odata/Sliders", clonedSlider).toPromise();
    }

    async updateSliderAsync(slider: Slider): Promise<Slider> {
        if (!slider)
            throw new Error("Invalid Slider to update");
        if (!slider.SliderID)
            throw new Error("Slider does not have SliderID therefore does not qualify to be updated.");
        const clonedSlider = this.ensureProperties({ ...slider }); //clone to save original with its SliderItemList that is normally deleted after
        delete clonedSlider.SliderItemList;
        return await this.soNetProxy.put$<Slider>(`/odata/Sliders(${slider.SliderID})`, clonedSlider).toPromise();
    }

    async saveOrUpdateSliderAsync(slider: Slider): Promise<Slider> {
        if (!slider)
            throw new Error("Invalid Slider to save or update");
        let objectSaved = !this.isEmpty(slider.SliderID);
        if (objectSaved)
            return await this.updateSliderAsync(slider);
        else
            return await this.saveSliderAsync(slider);
    }

    /**
     * Saves unique ID of the Slider to a Site represented by SiteName.
     * @param siteName Unique ID/name of the Site to which associate SliderID.
     * @param sliderID Unique ID of the Slider which to associate with a Site.
     */
    async saveSliderForSiteAsync(siteName: string, sliderID: string) {
        if (!siteName)
            throw new Error("Invalid siteName while saving Slide for Site");
        if (!sliderID)
            throw new Error("Invalid sliderID while saving Slide for Site");
        const url = `/odata/Sites('${siteName}')`;
        const body = { "SliderID": sliderID };
        return await this.soNetProxy.patch$(url, body).toPromise();
    }

    async saveSliderItemAsync(sliderItem: SliderItem): Promise<SliderItem> {
        if (!sliderItem)
            throw new Error("Invalid SliderItem to save.");
        return await this.soNetProxy.post$<SliderItem>("/odata/SliderItems", this.ensureProperties(sliderItem)).toPromise();
    }

    async updateSliderItemAsync(sliderItem: SliderItem): Promise<SliderItem> {
        if (!sliderItem)
            throw new Error("Invalid SliderItem to update");
        if (!sliderItem.SliderItemID)
            throw new Error("SliderItem does not have a valid SliderItemID therefore does not qualify to be updated");

        return await this.soNetProxy.put$<SliderItem>(`/odata/SliderItems(${sliderItem.SliderItemID})`, this.ensureProperties(sliderItem)).toPromise();
    }

    async saveOrUpdateSliderItemAsync(sliderItem: SliderItem): Promise<SliderItem> {
        if (!sliderItem)
            throw new Error("Invalid SliderItem to save or update.");
        const objectSaved = !this.isEmpty(sliderItem.SliderItemID)
        if (objectSaved)
            return await this.updateSliderItemAsync(sliderItem);
        else
            return await this.saveSliderItemAsync(sliderItem);
    }

    async uploadSliderItemImageAsync(sliderItemID: string, imageDataUri: string, cropRectangle?: Rectangle): Promise<SliderItem> {
        const url = `/odata/SliderItems(${sliderItemID})/SoNET.UploadImage`;
        const imageBlob = this.utilsService.dataURItoBlob(imageDataUri);
        let formData: FormData = new FormData();
        formData.append("file", imageBlob, "slideimage");
        if (cropRectangle && cropRectangle.isValid) {
            formData.append("crop-left", cropRectangle.left.toString());
            formData.append("crop-top", cropRectangle.top.toString());
            formData.append("crop-right", cropRectangle.right.toString());
            formData.append("crop-bottom", cropRectangle.bottom.toString());
        }
        formData.append("SiteName", this.sonetConfigService.config.siteName!);
        return await this.soNetProxy.post$<SliderItem>(url, formData).toPromise();
    }

    async uploadSliderItemVideoAsync(sliderItemID: string, videoDataUri: string): Promise<SliderItem> {
        const url = `/odata/SliderItems(${sliderItemID})/SoNET.UploadVideo`;
        const imageBlob = this.utilsService.dataURItoBlob(videoDataUri);
        let formData: FormData = new FormData();
        formData.append("file", imageBlob, "slideVideo");
        formData.append("SiteName", this.sonetConfigService.config.siteName!);
        return await this.soNetProxy.post$<SliderItem>(url, formData).toPromise();
    }

    async deleteSliderItemAsync(sliderItemID: string): Promise<SliderItem> {
        if (!sliderItemID)
            throw new Error("Invalid SliderItemID while deleting SliderItem");
        const url = `/odata/SliderItems(${sliderItemID})`;
        return await this.soNetProxy.delete$<SliderItem>(url).toPromise();
    }

    async isSliderVideoProcessing(sliderItemID: string) {
        if (!sliderItemID)
            throw new Error("Invalid SliderItemID while checking SliderItem video processing status");
        const url = `/api/ObjectJobs/GetJobState?objectID=${sliderItemID}&objectTypeName=MediaLibrarianCore.SliderItem`;
        const jobState = await this.soNetProxy.get$<string>(url).toPromise();
        if (!jobState)
            return false;
        return jobState !== "Unknown" && jobState !== "Succeeded";
    }

    async updateSeoScripts(siteName: string, seoScripts: string) {
        if (!siteName)
            throw new Error("Invalid siteName while updating seo scripts");
        if (!seoScripts)
            return;
        const url = `odata/Sites('${siteName}')/SoNET.UpdateSEOScripts`;
        const postObject = { "SEOScripts": seoScripts };
        await this.soNetProxy.post$(url, postObject).toPromise();
    }

    isEmpty(value: string) {
        return !value || value === '00000000-0000-0000-0000-000000000000';
    }


    /*
    Properties that come from regular API (not OData) might bring incompatible data types when they are further processed via non-regular API way (OData).    
    For example: UpdatedTime is returned via regular API as DateTime. Sending it back via OData route will result in 406 response as OData API all expect 
    DateTimeOffsets. 
    */
    ensureProperties(object: any): any {
        if (!object) return object;
        delete object["UpdatedTime"];
        delete object["IsMinHeight"];
        return object;
        // let { UpdatedTime, ...subset } = object; //remove UpdateTime
        // return subset;
    }
}
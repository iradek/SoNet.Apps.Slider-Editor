import { Component, OnInit, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Slider } from "../models/slider";
import { SoNetValidationService } from "@iradek/sonet-appskit";
import { SliderItem } from "../models/sliderItem";

@Component({
    selector: "sonet-editSlider",
    templateUrl: "./editSlider.html"
})
export class EditSlider implements OnInit {

    @Input()
    sliderItemList: SliderItem[] | undefined = [];

    get isMinHeightControl() { return this.editSliderForm ? this.editSliderForm.get("IsMinHeight") : null; };

    private _slider: Slider | undefined;
    get slider(): Slider {
        if (!this._slider) {
            this._slider = new Slider();
            //some default values
            this._slider.Height = 300;
            this._slider.Interval = 3;
        }
        return this._slider;
    }
    @Input()
    set slider(value: Slider) {
        this._slider = value;
        this.buildForm();
        this.fillControlFromInstance(value);
    }

    getSliderObject(): Slider {
        if (this.editSliderForm)
            Object.assign(this.slider, this.editSliderForm.value);
        if (this.isMinHeightControl)
            this.slider.MinHeight = !!this.isMinHeightControl.value ? this.slider.Height : null;
        return this.slider;
    }

    get valid(): boolean {
        if(!this.editSliderForm)
            return false;
        return this.editSliderForm.valid;
    }

    editSliderForm?: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        this.slider.Disabled = false;
        this.slider.ShowPrevNext = true;
    }

    ngOnInit() {
        this.buildForm();
    }

    ngAfterViewInit() {
    }

    buildForm(): void {
        this.editSliderForm = this.formBuilder.group({
            "Disabled": [this.slider.Disabled || false, [Validators.required]],
            "Height": [this.slider.Height, [Validators.required, Validators.minLength(1), Validators.maxLength(4), SoNetValidationService.invalidNumber]],
            "Interval": [this.slider.Interval, [Validators.required, Validators.minLength(1), Validators.maxLength(5), SoNetValidationService.invalidNumber]],
            "ShowPrevNext": [this.slider.ShowPrevNext || false, [Validators.required]],
            "ShowSlideIndicators": [this.slider.ShowSlideIndicators || false, [Validators.required]],
            "IsMinHeight": [(this.slider.MinHeight || 0) > 0]
        });
    }

    fillControlFromInstance(instance: Slider) {
        if (!instance)
            return;
    }
}
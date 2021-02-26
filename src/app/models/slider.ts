import { SliderItem } from "../models/sliderItem";

export class Slider {
    Interval!: number;
    Height!: number;
    MinHeight: number | null = null;
    Width!: number;
    SliderID!: string;
    Disabled!: boolean;
    ShowPrevNext!: boolean;
    ShowSlideIndicators!: boolean;
    CreatedTime!: Date;
    IsFromSiteTemplate!: boolean;
    IsFromDefaultTemplate!: boolean;
    SliderItemList: SliderItem[] = [];
}
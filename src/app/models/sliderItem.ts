import { ɵflushModuleScopingQueueAsMuchAsPossible } from "@angular/core";

export class SliderItem {
    SliderItemID!: string;
    SliderID!: string;
    SliderItem!: string;
    ImagePath!: string;
    VideoPath!: string;
    Muted?: boolean = true;
    TagTitle!: string;
    TagMessage!: string;
    ButtonText!: string;
    ButtonUrl!: string;
    OverlayStyle!: string;
    TagTitleStyle!: string;
    TagMessageStyle!: string;
    ButtonStyle!: string;
    SlideIndicatorStyle!: string;
    Order?: number;
    CreatedTime!: Date;
    Animation: string | null = null;
}
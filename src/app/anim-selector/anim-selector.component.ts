import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { SlideAnimations, SlideAnimation } from '../models/slideAnimation';

@Component({
    selector: 'app-anim-selector',
    templateUrl: './anim-selector.component.html',
    styleUrls: ['./anim-selector.component.css']
})
export class AnimSelectorComponent implements OnInit {

    sliderAnimations = SlideAnimations;

    constructor() { }

    private _selectedAnimation?: SlideAnimation;
    @Input()
    set selectedAnimation(value: SlideAnimation | undefined) {
        this._selectedAnimation = value;
    }
    get selectedAnimation(): SlideAnimation | undefined {
        if (!this._selectedAnimation)
            this._selectedAnimation = this.sliderAnimations.find(a => a.name == 'none');
        return this._selectedAnimation!;
    }

    @Output() animationSelectedEvent = new EventEmitter<SlideAnimation>();

    ngOnInit() {

    }

    animation_click(animation: SlideAnimation) {
        this.selectedAnimation = animation;
        this.animationSelectedEvent.emit(animation);
    }

}

import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Font, FontPickerComponent, FontPickerDirective } from 'ngx-font-picker';

const SIZE_LABEL:string = 'vw';
@Component({
  selector: 'app-font-selector',
  templateUrl: './font-selector.component.html',
  styleUrls: ['./font-selector.component.scss']
})
export class FontSelectorComponent implements OnInit {
  @Input() defaultFontSize: number = 10;
  @Input()  font: (Font | undefined);
  @Output() fontChange = new EventEmitter<Font|undefined>();

  selectorFont: Font;
  fontSize: number;
  
  @ViewChild(FontPickerDirective) fontpicker!: FontPickerDirective;

  
  constructor() { }

  ngOnInit(): void {
    if(this.font){
      this.selectorFont = new Font(this.font);
      this.fontSize = Number.parseFloat(this.selectorFont.size);
    }else{
      this.fontSize = this.defaultFontSize;
    }
  }

  get sizelabel():string{
    return SIZE_LABEL;
  }

  selectFont(){
    if(this.selectorFont){
      this.font = new Font(this.selectorFont);
      this.font.size = this.fontSize + SIZE_LABEL;
      this.fontChange.emit(this.font);
      this.fontpicker.closeDialog();
    }
  }
  getFontLabel(): string{
    return this.font ? this.font.family : "Select font";
  }
}

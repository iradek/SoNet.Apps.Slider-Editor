import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Font, FontPickerComponent, FontPickerDirective } from 'ngx-font-picker';

@Component({
  selector: 'app-font-selector',
  templateUrl: './font-selector.component.html',
  styleUrls: ['./font-selector.component.scss']
})
export class FontSelectorComponent implements OnInit {
  @Input()  font: (Font | undefined);
  @Output() fontChange = new EventEmitter<Font|undefined>();

  selectorFont: Font;
  
  @ViewChild(FontPickerDirective) fontpicker!: FontPickerDirective;

  
  constructor() { }

  ngOnInit(): void {
    if(this.font){
      this.selectorFont = new Font(this.font);
    }
  }

  selectFont(){
    if(this.selectorFont){
      this.font = new Font(this.selectorFont);
      this.fontChange.emit(this.font);
      this.fontpicker.closeDialog();
    }
  }
  getFontLabel(): string{
    return this.font ? this.font.family : "Select font";
  }
}

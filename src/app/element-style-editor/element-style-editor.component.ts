import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Font } from 'ngx-font-picker';

@Component({
  selector: 'app-element-style-editor',
  templateUrl: './element-style-editor.component.html',
  styleUrls: ['./element-style-editor.component.css']
})
export class ElementStyleEditorComponent implements OnInit {
  private _formControl: FormControl; // private property _item

  get formCtrl(): FormControl { 
    return this._formControl;
  }
  
  @Input("formCtrl")
  set formCtrl(val: FormControl) {
    this._formControl = val;
    if(this.formCtrl){
      this.onFormUpdate();
    }
  }
  
  @Input()  fontfile: string;
  @Output() fontfileChange = new EventEmitter<string>();

  constructor() { }

  font: Font = new Font({
      family: 'Roboto',
      size: '14px',
      style: 'regular',
      styles: ['regular']
  });

  private styleValue(){
    return (this.formCtrl.value as string).split(";").filter(t=>t && t.indexOf("font")==-1);
  }
  private fontValue(){
    return (this.formCtrl.value as string).split(";").filter(t=>t && t.indexOf("font")!=-1);
  }
  private onFormUpdate(){
    this.formCtrl.valueChanges.subscribe(this.inputChanged);  //TODO: unsubscribe
    const parsed_font = this.fontValue().map(val=>{
      return {
        value: val.split(':')[1].trim(),
        prop: val.split(':')[0].replace('font-', '').replace('weight', 'style').trim()
      };
    });
    parsed_font.forEach(val=>{
      (<any>this.font)[val.prop] = val.value;  //TODO: not realy safe
    });
    this.styleValue().join(";");
  }
  ngOnInit(): void {
  }

  inputChanged($event:any){
    this.formCtrl.setValue($event + ";" + this.fontValue().join(";"), { emitEvent: false});
  }

  onFontChange($event:Font){
    let selectedfile = $event.files[$event.style];
    console.log(selectedfile);
    this.fontfile = selectedfile;
    this.fontfileChange.emit(this.fontfile);
    const style = $event.getStyles();
    let styleStr = "";
    Object.keys(style).forEach(prop=> styleStr += prop + ":" + style[prop] + ";");
    this.formCtrl.setValue(this.styleValue().join(";") + ";" + styleStr);
  }
}

import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {

  constructor() { }

  /**
   * Converts data URI image representation to its blob representation
   * @param dataURI Base64 encoded data URI representation of an image to convert. Required.
   */
  dataURItoBlob(dataURI: string): Blob {
    if (!dataURI || dataURI.length == 0)
      throw new Error("Invalid dataURI to convert to blob.");
    // convert base64 to raw binary data held in a string    
    let byteString = atob(dataURI.split(',')[1]);
    // separate out the mime component
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    let array = [];
    for (var i = 0; i < byteString.length; i++) {
      array.push(byteString.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: mimeString });
  }
}

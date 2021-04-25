import { Font } from 'ngx-font-picker';

export interface FontFiles{
    TagTitleFont?: Font;
    TagMessageFont?: Font;
    ButtonFont?: Font;
}

export function toFontTag(fontUrl: string) {
    return ` <link href='${fontUrl}' rel='stylesheet' type='text/css'>`;
}

export function toFontUrl(font: Font) {
    var apiUrl = [];
    apiUrl.push('https://fonts.googleapis.com/css?family=');        //TODO: change to css2
    apiUrl.push(font.family.replace(/ /g, '+'));
    apiUrl.push(':');
    apiUrl.push(font.style);

    var url = apiUrl.join('');
    return url;
};
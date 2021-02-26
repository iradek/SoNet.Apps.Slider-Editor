export interface SlideAnimation {
    name: string;
    fileName: string;
}

export const SlideAnimations : SlideAnimation[] = [
    { name: "none", fileName: "none.png"},
    { name: "kenburns", fileName: "kenburns.gif" },
    { name: "kenburns-reverse", fileName: "kenburns-reverse.gif" },
    { name: "kenburns-left", fileName: "kenburns-left.gif" },
    { name: "kenburns-left-reverse", fileName: "kenburns-left-reverse.gif" },
    { name: "kenburns-right", fileName: "kenburns-right.gif" },
    { name: "kenburns-right-reverse", fileName: "kenburns-right-reverse.gif" }
];

export class Rectangle {
    constructor(public left: number, public top: number, public right: number, public bottom: number) {
    }

    isValid = this.left >= 0 && this.top >= 0 && this.right >= 0 && this.bottom >= 0;
}
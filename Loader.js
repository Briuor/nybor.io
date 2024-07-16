export default class Loader {
    constructor() {
        this.images = {};
    }

    loadImage(name, src) {
        let img = new Image();
        return new Promise((resolve, reject) => {
            this.images[name] = img;
            this.images[name].onload = () => {
                resolve(img);
            }
            this.images[name].onerror = () => {
                console.log('Error on load ' + src);
                reject(false);
            };
            img.src = src;
        })
    }

    getImage(name) {
        return (name in this.images) ? this.images[name] : null;
    }
}
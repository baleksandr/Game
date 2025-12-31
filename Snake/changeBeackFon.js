let imageBackFon
let newImageFon = 0;

imageBackFon = setInterval(() => changeImageBack(), 60000);

function changeImageBack() {
    newImageFon++;
    console.log(newImageFon)
    if (newImageFon > 6) newImageFon = 1;

    const imageUrlJpg = `img/background_${newImageFon}.jpg`;
    console.log(imageUrlJpg)
    setBackgroundImage(imageUrlJpg);
}

function setBackgroundImage(imageUrl) {
    document.body.style.backgroundImage = `url('${imageUrl}')`;
}
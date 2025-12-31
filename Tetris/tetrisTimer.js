function startTimer() {
    //miliseconds
    miliseconds++
    miliseconds <= 9 ? milisecondsElement.innerText = "0" + `${miliseconds}` : milisecondsElement.innerText = miliseconds
    if (miliseconds > 99) {
        second++
        secondElement.innerText = "0" + `${second} :`
        miliseconds = 0
        milisecondsElement.innerText = "0" + miliseconds
    }
    //second
    second <= 9 ? secondElement.innerText = "0" + `${second} :` : secondElement.innerText = `${second} :`
    if (second > 59) {
        minute++
        minuteElement.innerText = "0" + `${minute} :`
        second = 0
        minuteElement.innerText = "0" + `${second} :`
    }
    //minutes
    minute <= 9 ? minuteElement.innerText = "0" + `${minute} :` : secondElement.innerText = `${minute} :`
    if (minute > 59) {
        hour++
        hourElement.innerText = "0" + `${hour} :`
        minute = 0
        minuteElement.innerText = "0" + `${minute} :`
    }
    //hour
    hour <= 9 ? hourElement.innerText = "0" + `${hour} :` : secondElement.innerText = `${hour} :`
}
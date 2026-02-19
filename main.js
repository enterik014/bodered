console.log("bullshit")

const timePerDay = 1000 * 60
const apps = [
    "www.instagram.com",
    "discord.com",
    "www.tiktok.com",
    "x.com"
]
const alarms = [
    1000 * 50,
    1000 * 40,
    1000 * 30,
    1000 * 20,
    1000 * 10
]

var remaningTime = timePerDay
var currentTimeOutId = null
var blocked = false

const globalRegex = "^[a-z]+\:\/\/{}\/"
const appsRegex = []
for (let i = 0; i <= apps.length - 1; i ++) {
    const app = apps[i]
    const appRegex = app.replaceAll(/\./g, "\\.")
    appsRegex.push(new RegExp(globalRegex.replace(/{}/, appRegex)))
}

function trackedUrl(url) {
    if (!url) {
        return false
    }
    for (let i = 0; i <= appsRegex.length - 1; i ++) {
        let regex = appsRegex[i]
        if (regex.test(url)) {
            return true
        }
    }
    return false
}

function killBoderedTabs() {
    console.log("mate todos todos o brasil morreu")
}

var lastTime = null 
function runMainTimeOut() {
    let nextAlarm = remaningTime
    let alarmValue = 0
    let noAlarm = true
    for (let i = 0; i <= alarms.length - 1; i ++) {
        alarmValue = alarms[i]
        if (nextAlarm > alarmValue) {
            nextAlarm -= alarmValue
            noAlarm = false
            break
        }
    }

    currentTimeOutId = setTimeout(() => {
        currentTimeOutId = null
        remaningTime = alarmValue
        lastTime = Date.now()

        if (noAlarm) {
            blocked = true
            killBoderedTabs()
        } else {
            runMainTimeOut()
        }

        console.log("chegou o alarme das {}, no rt {}".replace(/{}/, alarmValue).replace(/{}/, remaningTime))
    }, nextAlarm)
}

function onTabChanged(tab) {
    const isTracked = trackedUrl(tab.url)
    if (blocked) {
        browser.tabs.remove(tab.tabId)
        return
    }

    if (isTracked & currentTimeOutId !== null) {
        console.log(remaningTime)
        return
    }

    if (!isTracked & currentTimeOutId !== null) {
        clearTimeout(currentTimeOutId)
        currentTimeOutId = null
        remaningTime -= Date.now() - lastTime
        console.log(remaningTime)
        return 
    }

    if (!isTracked) {
        console.log(remaningTime)
        return
    }
    console.log(remaningTime)

    lastTime = Date.now()
    currentTimeOutId = 0
    console.log("hASHASDH")
    runMainTimeOut()
 }

async function onActivated(activeInfo) {
    let tab = await browser.tabs.get(activeInfo.tabId)
    onTabChanged(tab)
}

async function onUpdated(tabId, changeInfo, tab) {
    
}

browser.tabs.onUpdated.addListener(onUpdated)
browser.tabs.onActivated.addListener(onActivated)
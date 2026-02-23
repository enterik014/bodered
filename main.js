console.log("bullshit")

const timePerDay = 1000 * 10
const apps = [
    {
        "name": "instagram",
        "url": "*://www.instagram.com/*",
        "multiplier": 1
    },
    {
        "name": "x",
        "url": "*://x.com/*",
        "multiplier": 1
    },
    {
        "name": "netflix",
        "url": "*://www.netflix.com/*",
        "multiplier": 1
    },
    {
        "name": "tiktok",
        "url": "*://www.tiktok.com/*",
        "multiplier": 1
    },
]
const appsRegex = []
const appsUrls = []

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

const translateChars = {
    "*": ".+",
    ".": "\\."
}
for (const app of apps) {
    const urlMatch = app.url
    const regex = ["^"]

    for (const char of urlMatch) {
        const translated = translateChars[char]
        regex.push(translated ? translated : char)
    }
    regex[regex.length - 1] = "*"
    appsUrls.push(urlMatch)
    appsRegex.push(new RegExp(regex.join("")))
}

function showNotification(title, message) {
    browser.notifications.create({
        type: "basic",
        iconUrl: "icons/icon.png",
        title: title,
        message: message
    })
}

function getAppByUrl(url) {
    for (let i = 0; i <= appsRegex.length - 1; i ++) {
        let regex = appsRegex[i]
        if (regex.test(url)) {
            return apps[i]
        }
    }
    return false
}

async function killBoderedTabs() {
    const tabs = await browser.tabs.query({url: appsUrls})
    for (const tab of tabs) {
        browser.tabs.remove(tab.id)
    }
}

var lastTime = null 
function runMainTimeOut() {
    if (currentTimeOutId) { return }
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
    }, nextAlarm)
}

var lastapp = null
function onTabChanged(tab) {
    const app = getAppByUrl(tab.url)

    if (blocked) {
        if (app) {
            browser.tabs.remove(tab.id)
        }
        return
    }
    if (app && currentTimeOutId) {
        console.log("bodered para bodered")
        return
    }
    if (!app && currentTimeOutId) {
        console.log("bodered para unbodered")
        clearTimeout(currentTimeOutId)
        currentTimeOutId = null
        console.log(lastapp)
        remaningTime -= (Date.now() - lastTime) * lastapp.multiplier
        return 
    }
    if (!app) {
        console.log("unbodered para unbodered")
        return
    }

    console.log("unbodered para bodered")
    lastTime = Date.now()
    currentTimeOutId = 0
    runMainTimeOut()
    lastapp = app
 }

async function onActivated(activeInfo) {
    let tab = await browser.tabs.get(activeInfo.tabId)
    onTabChanged(tab)
}

async function onUpdated(tabId, changeInfo, tab) {
    if (changeInfo.status != "complete") { return }

    if (tab.active) {
        onTabChanged(tab)
        return
    }

    const app = getAppByUrl(tab.url)
    if (blocked && app) {
        browser.tabs.remove(tabId)
    }
}

function AddTime() {

}

setInterval(() => {
    if (!lastTime) { return }
    if (currentTimeOutId) {
        console.log(remaningTime - (Date.now() - lastTime))
    } else {
        console.log(remaningTime)
    }
    
}, 100);

browser.tabs.onUpdated.addListener(onUpdated)
browser.tabs.onActivated.addListener(onActivated)
browser.browserAction.onClicked.addListener(AddTime)
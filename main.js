console.log("bullshit")

const timeReachedMessage = "Time reached, killing all bodered tabs, do some tasks to get more time"
const alarmReachedMessage = "You have {{}} minutes left on bodered tabs."
const taskCompletedMessage = "You finished a task, so now you have one extra hour"

const timePerClick = 1000 * 60 * 60
const apps = [
    {
        "name": "instagram",
        "url": "*://www.instagram.com/*"
    },
    {
        "name": "x",
        "url": "*://x.com/*"
    },
    {
        "name": "netflix",
        "url": "*://www.netflix.com/*"
    },
    {
        "name": "tiktok",
        "url": "*://www.tiktok.com/*"
    },
    {
        "name": "anime",
        "url": "*://animesonlineclub.net/*"
    },
    {
        "name": "anime",
        "url": "*://animesonlineclub.net/*"
    },
    {
        "name": "spotify",
        "url": "*://open.spotify.com/*"
    }
]
const appsRegex = []
const appsUrls = []

const alarms = [
    1000 * 60 * 60,
    1000 * 60 * 30,
    1000 * 60 * 10,
    1000 * 60,
]

var remaningTime = 0
var currentTimeOutId = null
var blocked = true

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

function showNotification(message) {
    browser.notifications.create({
        type: "basic",
        iconUrl: "icons/icon.png",
        title: "Bodered",
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
    currentTimeOutId = null
    showNotification(timeReachedMessage)
    const tabs = await browser.tabs.query({url: appsUrls})
    for (const tab of tabs) {
        browser.tabs.remove(tab.id)
    }
}

var lastTime = null 
function runMainTimeOut() {
    if (currentTimeOutId) {
        clearTimeout(currentTimeOutId)
    }

    let nextAlarm = remaningTime
    let alarmValue = 0
    let noAlarm = true
    for (let i = 0; i <= alarms.length - 1; i ++) {
        if (nextAlarm > alarms[i]) {
            alarmValue = alarms[i]
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
            const message = alarmReachedMessage.replace(/{{}}/, alarmValue / (1000 * 60))
            runMainTimeOut()
            showNotification(message)
        }
    }, nextAlarm)
}

var lastapp = null
function onTabChanged(tab) {
    const app = getAppByUrl(tab.url)

    if (blocked) {
        if (app) {
            browser.tabs.remove(tab.id)
            showNotification(timeReachedMessage)
        }
        return
    }
    if (app && currentTimeOutId) {
        lastapp = app
        return
    }
    if (!app && currentTimeOutId) {
        clearTimeout(currentTimeOutId)
        currentTimeOutId = null
        remaningTime -= Date.now() - lastTime
        return 
    }
    if (!app) {
        return
    }

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
        showNotification(timeReachedMessage)
    }
}

function AddTime() {
    showNotification(taskCompletedMessage)
    remaningTime += timePerClick
    if (!blocked) {
        runMainTimeOut()
    }
    blocked = false
}

console.log(alarms)

browser.tabs.onUpdated.addListener(onUpdated)
browser.tabs.onActivated.addListener(onActivated)
browser.browserAction.onClicked.addListener(AddTime)
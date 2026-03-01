function onButtonClicked(button) {
    let miliseconds = 0
    switch (button.target.textContent) {
        case "10 minutes":
            miliseconds = 1000 * 60 * 10
            break
        case "30 minutes":
            miliseconds = 1000 * 60 * 30
            break
        case "1 hour":
            miliseconds = 1000 * 60 * 60
            break
    }

    let action = miliseconds === 0 ? "reset" : "add"
    browser.runtime.sendMessage({action: action, miliseconds: miliseconds})
}

document.addEventListener("click", onButtonClicked)
console.log("Reading Page")

chrome.storage.sync.get('task', (item) => {
    if (Object.keys(item).length) {
        console.log('Task Currently Running');
        let task = item.task;
        if (task.task_type == "google_search") activateGoogleSearch(task)
        if (task.task_type == "journey") activateJourneyTask(task)
    }
});

function activateGoogleSearch(task){
    console.log('Google Search Task');
    console.log('Google Search Task Details', task.google_search)
    const currentUrl = window.location;
    console.log(currentUrl, task);
    // is the user currently in the google chrome task
    if (currentUrl.href === "https://www.google.com/") {
        console.log("hello you are currently on the Google search bar")
        alert("hello you are currently on the Google search bar")
    }
}

function activateJourneyTask(task) {
    console.log('Journey Task Active');
    console.log(`Journey Task Details, Total step is ${task.journey.length} on`, task.journey);
    const currentUrl = window.location;

    // check if a user is typing on the google input box
    const inputbox = document.querySelector("input")
    inputbox.addEventListener("input", (e) => {
        let usersData = e.target.value;

        chrome.runtime.sendMessage({});

    })

}
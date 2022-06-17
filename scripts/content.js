console.log("Extention Loaded yes 2")

chrome.storage.sync.get('task', (item) => {
    let task = item.task;
    console.log(task)
    if(task){
        if(task.task_type == "google_search") activateGoogleSearch(task)
        if(task.task_type == "journey") activateJourneyTask(task)
    }
})



function activateGoogleSearch(task){
    const currentUrl = window.location
    console.log(currentUrl, task);
    // is the user currently in the google chrome task
    if (currentUrl.href === "https://www.google.com/") {
        console.log("hello you are currently on the Google search bar")
        alert("hello you are currently on the Google search bar")
    }
}
 
function activateJourneyTask(task){
    console.log(task);
}
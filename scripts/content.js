console.log("Reading Page")
// Run Task
chrome.storage.sync.get('task', (item) => {
    if (Object.keys(item).length) {
        let task = item.task;
        if (task.task_type == "google_search") activateGoogleSearch(task)
        if (task.task_type == "journey") activateJourneyTask(task)
    }
});


// Task Functionalities
function showModal(open = 1, content = null){
   let template = `/templates/modal${open}.html`,
       modalId = `#clishaModelId${open}`;

    fetch(chrome.runtime.getURL(template))
        .then(r => r.text())
        .then(html => {
            console.log('Modal Template Loaded');
            document.body.insertAdjacentHTML('beforeend', html);
            $(modalId).modal('show');
            if(content){
                let entry = document.querySelector('#boost-entry');
                console.log('Opening Extended Modal');
                if(content.head){
                    let headerElem = document.createElement('h4');
                    headerElem.innerHTML = content.head;
                    entry.appendChild(headerElem);
                }

                if(content.body ){
                    let paramElem = document.createElement('p');
                    paramElem.innerHTML = content.body;
                    entry.appendChild(paramElem);
                }

            }
    });
}

function activateGoogleSearch(task){
    console.log('Google Search Task');
    const currentUrl = window.location;
    let clisha_search =  JSON.parse(task.google_search);
    console.log("Google Search Task Details >>",  clisha_search);
    
    
    if(currentUrl.href.includes(task.url)){
        let timeout = 20;
        console.log('Reach Destination');
        console.log(`Deactivating Task after ${timeout} seconds`)
        setTimeout(()=> {
            deactivateExtensionTask();
        }, timeout * 1000);
        
    // Google Result Page  
    }else if(currentUrl.href.includes('search?q=')){
        let url = currentUrl.href.split('?'),
            query = parseQueryParam(url[1]);

        let searched_phrase = query.q.replaceAll('+', ' ')
        
        console.log(url, query, searched_phrase);
        if(clisha_search.search_phrase.toLowerCase() === searched_phrase.toLowerCase()){
            showModal(1, {
                head: `Click ${clisha_search.title}`,
                body: `Find "${clisha_search.title}" from the result, and click on the title that include "${task.url}" as the link`,
            }); 
        }else{
            showModal(1, {head: `Kindly Re-enter "${clisha_search.search_phrase}" in the Google Search bar`});
        }

    // Google Search Page
    }else if(currentUrl.href.includes('google.com')) {
        showModal(1, {head: `Enter ${clisha_search.search_phrase} in the Google Search bar`});
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

        // chrome.runtime.sendMessage({});

    })

}

function parseQueryParam(url) {
    var query = {};
    var pairs = (url[0] === '?' ? url.substr(1) : url).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
} 

function deactivateExtensionTask(){
    // ["task", "task_active"]
    chrome.storage.sync.clear(function() {
        console.log('Task Deactivated');
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    });
}
console.log("Reading Page")
// Current Domain
let domain = window.location.href
domain = domain.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)


// Run Task
chrome.storage.sync.get('task', (item) => {
    if (Object.keys(item).length) {
        let task = item.task;
        if (task.task_type == "google_search") activateGoogleSearch(task)
        if (task.task_type == "journey") activateJourneyTask(task)
    }
});
// Sync Task with Backround 
chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => { 
    let task = message.task;
    if (task.task_type == "google_search") activateGoogleSearch(task)
    if (task.task_type == "journey") activateJourneyTask(task)
    return true;
});

// ACtions
function uyasvghdxyhvdxchgvdxjbcv_was(e){
   
}



// Task Functionalities
function showModal(open = 1, content = null){
   let template = `/templates/modal${open}.html`,
       modalId = `#clishaModelId${open}`;

    fetch(chrome.runtime.getURL(template))
        .then(r => r.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html);
            $(modalId).modal('show');
            if(content){
                let entry = document.querySelector('#boost-entry'),
                    error = document.querySelector('#boost-error');
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

                error.style.display = (content.error) ? "block" : "none";  

                document.getElementById('task-deactivate').addEventListener('click', handleDeactivate(modalId), false);
            }
    });
}

function activateGoogleSearch(task){
    const currentUrl = window.location;
    let clisha_search =  JSON.parse(task.google_search);
    
    if(domain[0] == 'google.com') {
        if(domain[0] == 'google.com' && currentUrl.href.includes('search?q=')){
            let url = currentUrl.href.split('?'),
                query = parseQueryParam(url[1]);
    
            let searched_phrase = query.q.replaceAll('+', ' ')
            
            if(clisha_search.search_phrase.toLowerCase() === searched_phrase.toLowerCase()){
                showModal(1, {
                    head: `Click ${clisha_search.title}`,
                    body: `Please go through the Google Search results and click on the result with the website title ${clisha_search.title}`,
                }); 
            }else{
                showModal(1, { error: true, head: `Oops you have entered the wrong phrase please try again by entering "${clisha_search.title}"`});
            }
            return true;
        }
        showModal(1, {head: `Please enter the copied Search Phrase into the Google Search Bar and hit the Enter`});
    } else{
        console.log('Destination', task.url, currentUrl.href.match(task.url));
        if(currentUrl.href.match(task.url) || currentUrl.href+'/' == task.url){
            showModal(1, {head: `You have clicked on the right page! Please interact with this page until the timer went down `});
            let timeout = 40;
            console.log(`Deactivating Task after ${timeout} seconds`);
     
            setTimeout(()=> {
                completeExtensionTask(task);
            }, timeout * 1000);
        }else {
            showModal(1, { error: true, head: `You have clicked on the wrong page! Please go back to Google search result and click on  ${clisha_search.title}`});
        }
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


function completeExtensionTask(task){
    chrome.storage.sync.clear(function() {
        console.log('Task Deactivated');
        chrome.runtime.sendMessage( { reload: 'true' }, (response) => { console.log('Message Sent ') });

        window.location.href = `https://clisha-stagging.netlify.app/dashboard/reward?t=${task.id}&p=${task.points}`
        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    });
}

function handleDeactivate(modalId) {
    chrome.storage.sync.clear(function() {
        chrome.runtime.sendMessage( { reload: 'true' }, (response) => {    $(modalId).modal('show');  });

        var error = chrome.runtime.lastError;
        if (error) {
            console.error(error);
        }
    });
 
}
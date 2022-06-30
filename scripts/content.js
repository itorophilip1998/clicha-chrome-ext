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
// console.log(chrome.runtime.getURL("images/logo.png"))

// Task Functionalities
function showModal(open = 1, content = null){
   let template = `/templates/modal${open}.html`,
       modalId = `#clishaModelId${open}`;

    fetch(chrome.runtime.getURL(template))
        .then(r => r.text())
        .then(html => {
            document.body.insertAdjacentHTML('beforeend', html);
           
            if(content){
                let entry = document.querySelector('#boost-entry'),
                    error = document.querySelector('#boost-error');
                    
                if(content.head){
                    let headerElem = document.createElement('h5');
                    headerElem.innerHTML = content.head;
                    entry.appendChild(headerElem);
                }

                if(content.body ){
                    let paramElem = document.createElement('p');
                    paramElem.innerHTML = content.body;
                    entry.appendChild(paramElem);
                }
                
                if(content.question){
                    let questionElem = document.createElement('h4');
                    questionElem.innerHTML = content.question;
                    entry.appendChild(questionElem);
                }

                if(content.error) error.style.display = (content.error) ? "block" : "none";  
 
            }    
            $(modalId).modal('show');
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
                showModal(2, { error: true, head: `Oops you have entered the wrong phrase please try again by entering "${clisha_search.title}"`});
            }
            return true;
        }
        showModal(1, {head: `Please enter the copied Search Phrase into the Google Search Bar and hit enter`});
    } else{
        if(currentUrl.href.match(task.url) || currentUrl.href+'/' == task.url){

            console.log('Decider', task.interaction)
            if(task.interactionId && task.interaction && task.interaction.interaction_type == 'multistep'){
                showModal(1, {
                    head: `Great! Please read the question below and click on the button to answer it `,
                    question: task.interaction.question
                });
                multistepInteraction(task)
            }else{
                showModal(1, {head: `You have clicked on the right page! Please interact with this page until the timer went down `});
                timerInteraction(task)
            }

        }else {
            showModal(2, { error: true, head: `You have clicked on the wrong page! Please go back to Google search result and click on  "${clisha_search.title}"`});
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
 
function multistepInteraction(task) {
    console.log('Multistep Interaction Started');
    let multistep = `/templates/interaction_multistep.html`;
    fetch(chrome.runtime.getURL(multistep))
    .then(r => r.text())
    .then(html => {
        document.body.insertAdjacentHTML('beforeend', html);
    });
}    

function timerInteraction(task) {
    console.log('Timer Interaction Started');
    let timer = `/templates/interaction_timer.html`;
    fetch(chrome.runtime.getURL(timer))
    .then(r => r.text())
    .then(html => {
        document.body.insertAdjacentHTML('beforeend', html);

        let warning=document.getElementById("clisha_warning");
        let clisha_timer=document.getElementById("clisha_timer");

        var timeValue = (task.interaction) ? task.interaction.duration: 30; 
        let intervalId=  setInterval(()=> {
            timeValue--;
            warning.innerText =  "Hello! Do not close or leave this window ";
            clisha_timer.innerText =  timeValue;
            if (timeValue==0) {
                clearInterval(intervalId)
                completeExtensionTask(task);
            }
        }, 1000);

    });
}    




function completeExtensionTask(task){
    chrome.storage.sync.clear(function() {
        console.log('Task Deactivated');
        chrome.runtime.sendMessage( { reload: 'true' }, (response) => { console.log('Message Sent ') });

        window.location.href = `https://clisha-stagging.netlify.app/dashboard/reward?t=${task.id}&p=${task.points}`
        var error = chrome.runtime.lastError;
        if (error) console.error(error);  throw error; 
    });
}


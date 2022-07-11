console.log("Reading Page")
// Global Variable
let domain = window.location.href;
domain = domain.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)
let task,   step = null, 
    active_modal,
    currentJourney = {};

// Run Task
chrome.storage.sync.get(null, (item) => {
    if (Object.keys(item).length) {
        task = item.task;
        step = item.step;
        if (task.task_type == "google_search") activateGoogleSearch()
        if (task.task_type == "journey") activateJourneyTask()
    }
});
// Sync Task with Backround 
chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => { 
    task = message.task;
    step = message.step;
    if (task.task_type == "google_search") activateGoogleSearch()
    if (task.task_type == "journey") activateJourneyTask()
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
            active_modal = document.querySelector(modalId);
            if(content){
                let entry = document.querySelector('#boost-entry'),
                    error = document.querySelector('#boost-error');

                if(content.step){
                    let stepElem = document.createElement('h4');
                    stepElem.innerHTML = `Step ${content.step} of  ${task.journey.length}`;
                    entry.appendChild(stepElem);
                }

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

            active_modal.classList.remove("clisha_modal_close")  
            active_modal.classList.add("clisha_modal_open")
        });
}

function activateGoogleSearch(){
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
                showModal(2, { error: true, head: `Oops you have entered the wrong phrase please try again by entering "${clisha_search.search_phrase}"`});
            }
            return true;
        }
        return showModal(1, {head: `Please enter the copied Search Phrase into the Google Search Bar and hit enter`});

    } else{
        if(currentUrl.href.match(task.url) || currentUrl.href+'/' == task.url){
            if(task.interactionId && task.interaction && task.interaction.interaction_type == 'multichoice'){
                showModal(1, {
                    head: `Great! Please read the question below and click on the answer button to answer it `,
                    question: task.interaction.question
                });
                multiChoiceInteraction(task)
            } else{
                showModal(1, {head: `You have clicked on the right page! Please interact with this page until the timer went down `});
                timerInteraction(task)
            }
        }else {
            showModal(2, { error: true, head: `You have clicked on the wrong page! Please go back to Google search result and click on  "${clisha_search.title}"`});
        }
    }
} 
  
function activateJourneyTask() {
    console.log('Journey Task Active');
    console.log(`Journey Task Details, Total step is ${task.journey.length} on`, task.journey);
    const currentUrl = window.location;
    let journeyTask = task.journey;
    currentJourney = journeyTask[step - 1];

    if(currentUrl.href.match(currentJourney.link) || currentUrl.href+'/' == currentJourney.link){
        let start = (step == 1) ? "Great! Let's go," : (step == task.journey.length) ? "Great! Almost done," : "Let's continue";
        let type =  "", question = null; 

        if(currentJourney.link_type == "video") type = "Kindly watch the video on this page. Watch the complete video to complete this step. Thanks ";
        if(currentJourney.link_type == "form") type = "Kindly watch the video on this page. Watch the complete video to complete this step. Thanks ";

        if(currentJourney.link_type == "content"){
            type = "Please go through the page  to attempt the question below. You can click on the answer button to answer it";
          
            question = currentJourney.step_interaction.question
            multiChoiceJourney()
        }

        showModal(1, { step,  head: start, body: type, question })

    }else{
        showModal(2, { error: true,step,  head: `You have clicked on the wrong page! Please visit "${currentJourney.link}" to continue.`});
    }
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
 
function timerInteraction(task) {
    console.log('Timer Interaction Started');
    let timer = `/templates/interaction_timer.html`;
    fetch(chrome.runtime.getURL(timer))
    .then(r => r.text())
    .then(html => { 
        document.body.insertAdjacentHTML('beforeend', html);

        let warning=document.getElementById("clisha_warning");
        let clisha_timer=document.getElementById("clisha_timer");

        var timeValue = (task.interaction) ? task.interaction.duration: 45; 
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

function multiChoiceInteraction(task) {
    console.log('Multichoice Interaction Started');
    let multichoice = `/templates/interaction_multichoice.html`;
    fetch(chrome.runtime.getURL(multichoice))
    .then(r => r.text())
    .then(html => {
        document.body.insertAdjacentHTML('beforeend', html);
        let question = document.querySelector('#multichoice-question'),
            option1 = document.querySelector('#option1'),
            option2 = document.querySelector('#option2'),
            option3 = document.querySelector('#option3'),
            option4 = document.querySelector('#option4'),
            option5 = document.querySelector('#option5');

        // console.log(task.interaction);
        question.innerHTML = task.interaction.question;
        option1.innerHTML = task.interaction.option1;
        option2.innerHTML = task.interaction.option2;

        if(task.interaction.option3){
            document.querySelector('.option3').style.display = "block";
            option3.innerHTML = task.interaction.option3;
        }
        if(task.interaction.option4){
            document.querySelector('.option4').style.display = "block";
            option4.innerHTML = task.interaction.option4;
        }
        if(task.interaction.option5){
            document.querySelector('.option5').style.display = "block";
            option5.innerHTML = task.interaction.option5;
        }
    });
}   

function multiChoiceJourney(currentJourney) {
    console.log('Multichoice Journey Started', currentJourney);
    let multichoice = `/templates/interaction_multichoice.html`;
    fetch(chrome.runtime.getURL(multichoice))
    .then(r => r.text())
    .then(html => {
        document.body.insertAdjacentHTML('beforeend', html);
        let question = document.querySelector('#multichoice-question'),
            option1 = document.querySelector('#option1'),
            option2 = document.querySelector('#option2'),
            option3 = document.querySelector('#option3'),
            option4 = document.querySelector('#option4'),
            option5 = document.querySelector('#option5');

        // console.log(task.interaction);
        question.innerHTML = currentJourney.step_interaction.question;
        option1.innerHTML = currentJourney.step_interaction.option1;
        option2.innerHTML = currentJourney.step_interaction.option2;

        if(currentJourney.step_interaction.option3){
            document.querySelector('.option3').style.display = "block";
            option3.innerHTML = currentJourney.step_interaction.option3;
        }
        if(currentJourney.step_interaction.option4){
            document.querySelector('.option4').style.display = "block";
            option4.innerHTML = currentJourney.step_interaction.option4;
        }
        if(currentJourney.step_interaction.option5){
            document.querySelector('.option5').style.display = "block";
            option5.innerHTML = currentJourney.step_interaction.option5;
        }
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


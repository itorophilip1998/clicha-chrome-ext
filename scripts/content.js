// Global Variable
const mode = 'PRODUCTION';
const dashboardUrl = (mode == 'TESTING') ? 'https://clisha-testing-user.netlify.app/dashboard/' : 'https://clisha.me/dashboard/';
     
let task, step = null, 
    active_modal, question_modal,
    toggle_modal,
    currentJourney = {};
let domain = window.location.href,
    currentUrl = window.location;
domain = domain.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)

// Silent Clisha extension if neccesary
function silentClishaExtension(){
    const clisha = 'clisha'; 
    if(  domain[0].includes(clisha)  ) return true;
    return false;
}

// Sync Task with Backround 
chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => { 
    // Start Extension
    if(message.form == true) return handleNextJourney()
    if(message.vid_completed == true) return handleNextJourney();
    // Silent Extension in some url
    const isSilent =  silentClishaExtension();
    if(!isSilent){
        task = message.task; 
        step = message.step;
        if (task.task_type == "google_search" || task.task_type == "search_journey") activateGoogleSearch()
        if (task.task_type == "journey") activateJourneyTask()
    }
    return true; 
});

// Run available task in the store 
chrome.storage.sync.get(null, (item) => {
    if (Object.keys(item).length) { 
        // Start Extension
        const isSilent =  silentClishaExtension();
        if(!isSilent){
            task = item.task;
            step = item.step;
            if (task.task_type == "google_search" || task.task_type == "search_journey") activateGoogleSearch()
            if (task.task_type == "journey") activateJourneyTask();
        } 
        return true;
    } 
});

// Confirm if given link match up
function handshake(link){
    // Remove unwannted string fron url
    link = link.replace('http://', '').replace('https://', '').replace('www.', '');
    //Split Url and parameter 
    link = link.split(/[?#]/)[0];
    var  links = [link , link +'/'];
    return(currentUrl.href.match(link) || links.includes(currentUrl.href));
}

function activateGoogleSearch(){
    const clisha_search =  JSON.parse(task.google_search);
    if(domain[0] == 'google.com') {
        if(domain[0] == 'google.com' && currentUrl.href.includes('search?q=')){
            let url = currentUrl.href.split('?'),
                query = parseQueryParam(url[1]);
    
            let searched_phrase = query.q.replaceAll('+', ' ')
            // and link is "${task.url}"
            if(clisha_search.search_phrase.toLowerCase() === searched_phrase.toLowerCase()){
                showModal(1, {
                    head: `Click ${clisha_search.title}`,
                    body: `Please go through the Google Search results and click on the result with the website title "${clisha_search.title}"`,
                }); 
            }else{
                showModal(2, { error: true, head: `Oops you have entered the wrong phrase please try again by entering "${clisha_search.search_phrase}"`});
            }
            return true;
        }
        return showModal(1, {head: `Please enter the copied Search Phrase into the Google Search Bar and hit enter`});
    } else{
        if(task.task_type == "google_search"){
            if(handshake(task.url) && document.referrer == 'https://www.google.com/'){
                if( task.interactionId && task.interaction && 
                    task.interaction.interaction_type == 'multichoice' 
                        || task.interaction.interaction_type == 'multistep'
                ){

                    showModal(1, {
                        head: `Great! Please read the question below and click on the answer button to answer it `,
                        question: (task.interaction) ? task.interaction.question : ''
                    });

                    multiChoiceInteraction();
                } else{
                    showModal(1, { head: `You have clicked on the right page! Please interact with this page until the timer went down `});
                    timerInteraction()
                }
            }else {
                showModal(2, { error: true, head: `You have clicked on the wrong page! Please go back to Google search result and click on  "${clisha_search.title}"`});
            }
        }else{
            activateSearchJourneyTask()
        }
    }

} 
  
function activateJourneyTask() {
    let journeyTask = task.journey;
    currentJourney = journeyTask[step - 1];


    if(handshake(currentJourney.link)){
        runJourneyInteraction();
    }else{
        showModal(2, { error: true,step,  head: `You have clicked on the wrong page! Please visit "${currentJourney.link}" to continue.`});
    }
}

function  activateSearchJourneyTask(){
    // const currentUrl = window.location; 
    currentJourney = task.journey[0]; 
    let clisha_search = JSON.parse(task.google_search);
    let links = [currentJourney.link, currentJourney.link+'?completed=vid'];

    console.log(currentJourney, step, task.task_type); 

    if(step <= 1  && handshake(currentJourney.link)){
        step = 1;
        if(step == 0) chrome.storage.sync.set(({ "step": step + 1 }));
        activateJourneyTask()
    }else if(step > 1){ 
        currentJourney = task.journey[step - 1];
        activateJourneyTask(); 
    }else {
        showModal(2, { error: true, head: `You have clicked on the wrong page! Please go back to Google search result and click on  "${clisha_search.title}"`});
    } 
}

function runJourneyInteraction(){ 
    let start = (step == 1) ? "Great! Let's go," : (step == task.journey.length) ? "Great! Almost done," : "Let's continue";
    let type =  "", question = null, interaction = null; 

    if(currentJourney.link_type == "video") {
         type = "Kindly watch the video on this page. Watch up to 40% of the video to complete this step. Thanks ";
        //  console.log('Video Journey', currentUrl.href); 
        //  setTimeout(() => { initiateJourneyVideo() }, 4 * 1000);  
    } 

    if(currentJourney.link_type == "form") {  
        type = "Kindly fill the form on this page to complete this step. Thanks ";
        initiateJourneyForm(currentJourney.link); 
    }

    if(currentJourney.link_type == "content"){
      
        question = currentJourney.step_interaction.question;
        interaction = currentJourney.step_interaction;

        // console.log('Journey Interaction ',interaction.interaction_type == 'timer');
        if(
            interaction && 
            interaction.interaction_type == 'multichoice' 
            || interaction.interaction_type == 'multistep'
        ){
            type = "Please Read the question below. You will find the answer on this Page! For answering it click on the button in the bottom right hand corner.";  
            multiChoiceJourney();
        }else{
            type = `You have clicked on the right page! Please interact with this page until the timer went down`;
            timerInteraction(); 
        }
    }
    // console.log(question, interaction);
    return  showModal(1, { step,  head: start, body: type, question, interaction });
}


// Task Functionalities
function showModal(open = 1, content = {}){
    let template = `/templates/modal${open}.html`,
        modalId = `#clishaModelId${open}`;
    let element = document.querySelector(modalId);
    if(element) element.remove();      

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
                 
                 // Add Question Interaction preview panel to modal
                 if(content.question){
                     let options = document.querySelector('#task-options-preview')
                         questionElem = document.createElement('h4');
                     questionElem.innerHTML = content.question;
                     entry.appendChild(questionElem);
                     task.interaction = (content.interaction) ? content.interaction : task.interaction;
 
                     let option1, option2, option3,option4, option5;
                     option1 = document.createElement('li');
                     option2 = document.createElement('li'); 
                    
 
                     if(task.interaction) {
                         option1.innerHTML = task.interaction.option1;
                         option2.innerHTML = task.interaction.option2
                         options.append(option1, option2) 
                         if(task.interaction.option3) { 
                             option3 = document.createElement('li');
                             option3.innerHTML = task.interaction.option3;
                             options.appendChild(option3)
                         }
                         if(task.interaction.option4){ 
                             option4 = document.createElement('li');
                             option4.innerHTML = task.interaction.option4;
                             options.appendChild(option4);
                         }
                         if(task.interaction.option5){ 
                             option5 = document.createElement('li');
                             option5.innerHTML = task.interaction.option5;
                             options.appendChild(option5)
                         }
                     }
                     
                 }
 
                 if(content.error) error.style.display = (content.error) ? "block" : "none";  
             }    
 
             // active_modal.classList.remove("clisha_modal_close")  
             active_modal.classList.add("clisha_modal_open")
         });
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


function initiateJourneyForm(link){
    chrome.runtime.sendMessage( 
        { trackForm : link }, (response) => { 
    });
}  

function timerInteraction() {
    // console.log('Timer Interaction Started');
    let timer = `/templates/interaction_timer.html`; 

    fetch(chrome.runtime.getURL(timer))
    .then(r => r.text())
    .then(html => { 
        document.body.insertAdjacentHTML('beforeend', html);

        let warning=document.getElementById("clisha_warning");
        let clisha_timer=document.getElementById("clisha_timer");

        var timeValue = (task?.interaction) ? task.interaction.duration:  
                        (currentJourney?.step_interaction) ? currentJourney.step_interaction.duration :   45; 
                        
        // console.log(currentJourney); 

        let intervalId=  setInterval(()=> {
            let currentTab = window.location.href;
            let url = (task.url) ? task.url : (currentJourney) ? currentJourney.link : '';
          
             
            if(handshake(url) && document.visibilityState === 'visible'){
                timeValue--;
                warning.innerText =  "Hello! Do not close or leave this window ";
                clisha_timer.innerText =  timeValue;
                if (timeValue==0) { 
                    clearInterval(intervalId)
                    completeExtensionTask();
                }
            }
        }, 1000);

    });
}    
  
function multiChoiceInteraction() {
    // console.log('Multichoice Interaction Started');
    const multichoice = `/templates/interaction_multichoice.html`;
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

function multiChoiceJourney() {
    // console.log('Multichoice Journey Started', currentJourney);
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

function completeExtensionTask(){
    chrome.storage.sync.clear(function() { 
        const url = `${dashboardUrl}reward?t=${task.id}&p=${task.points}`
        chrome.runtime.sendMessage( { completed: 'true' }, (response) => {  });
        const features = "right=100,top=100,width=600,height=450";
        window.open(url, '_blank', features);


        const overlay = document.querySelector('.clisha_overlay'),
              float   = document.querySelectorAll('.clisha_float')  ; 

      
        if(float.length) {
            float.forEach((f)=> {
                 f.style.display = "none";
            })
        }
        if(overlay)overlay.style.display = "none";

        var error = chrome.runtime.lastError;
        if (error) console.error(error);  throw error; 
    });
}

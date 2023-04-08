// console.log('Popup Page Running');

const mode = 'PRODUCTION';
const dashboardUrl = (mode == 'TESTING') ? 'https://clisha-testing-user.netlify.app/dashboard/' : 'https://clisha.me/dashboard/';

let task,     
    step = null, 
    currentJourney = {};

let popDetail =  document.querySelector("#popInfo"),
    taskActive =  document.querySelector("#taskActive"),
    taskInactive =  document.querySelector("#taskInactive"),
    taskUrl = document.querySelector('#clisha-task'),
    deactivateButton =  document.querySelector('#clisha-deactivate');

    
// Action on Popup 
chrome.storage.sync.get(null, (item) => {
    if (Object.keys(item).length) {
        task = item.task;
        step = item.step;
        activateTask(task);
    }
});

function activateTask(task) {
    let taskId = document.querySelector('#task-code-ied7yghfubj'),
        taskPoint = document.querySelector('#task-point-askjdcn'),
        taskSeach = document.querySelector('#task-search-idhfonksdx'),
        taskStep = document.querySelector('#task-step-djcfhbfcuvjbn'),
        taskDescription = document.querySelector('#task-description-udhjcgbjshbdx');

    taskActive.style.display = "block"; 
    taskInactive.style.display = "none";
    taskId.innerHTML = `${task.task_code}`; 
    taskPoint.innerHTML = `${task.points}`;

    if(task.task_type == 'google_search' || task.task_type == "search_journey" &&  step == 0){
        document.querySelector('#clisha-task-search').style.display = 'block'; 
        taskSeach.innerHTML = `${JSON.parse(task.google_search).search_phrase}`;
    }
 
    if(task.task_type == 'journey' || task.task_type == "search_journey" &&  step >= 1){
        currentJourney = task.journey[step - 1]; console.log(currentJourney);
        document.querySelector('#clisha-task-step').style.display = 'block'; 
        document.querySelector('#clisha-task-detail').style.display = 'block'; 
        taskStep.innerHTML = `Step ${step} of ${task.journey.length}`;
        taskDescription.innerHTML = currentJourney.description;
    }
}

taskUrl.addEventListener('click', function () {
    let baseUrl =  `${dashboardUrl}task`;
    chrome.tabs.create({ url: baseUrl });
})

deactivateButton.addEventListener('click', function () {
    chrome.storage.sync.clear(function() {
        taskActive.style.display = "none";
        taskInactive.style.display = "block"; 
        chrome.runtime.reload()
        //popDetail.innerHTML=`No active task <a href="#" id="clisha-task">click here</a>  to get and activate a task`;
        var error = chrome.runtime.lastError;
        if (error) console.log(error); throw error;
    });
});

chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => { 
    let task = message.task;
    activateTask(task)
    return true;
});

// //  
// chrome.tabs.query({ currentWindow : true, active : true }, function (tabs) {
//     let activeTab = tabs[0];
//     let domain = activeTab.url.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0]
//     chrome.tabs.sendMessage( { command: 'fetch', data: {domain} }, (response) => {
//         console.log(response)
//     });
// })
 // chrome.tabs.query({ currentWindow : true, active : true }, function (tabs) {
//     let activeTab = tabs[0];
//     console.log('Sending PopUp message');
//     chrome.tabs.sendMessage(activeTab.id, { command: 'openModal' });
// })

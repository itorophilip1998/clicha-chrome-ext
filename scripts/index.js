console.log('Popup Page Running');


let popDetail =  document.querySelector("#popInfo"),
    taskActive =  document.querySelector("#taskActive"),
    taskInactive =  document.querySelector("#taskInactive"),
    taskUrl = document.querySelector('#clisha-task'),
    deactivateButton =  document.querySelector('#clisha-deactivate');

    
// Action on Popup 
chrome.storage.sync.get('task', (item) => {
    if (Object.keys(item).length) {
        let task = item.task;
        activateTask(task);
        //  popDetail.innerHTML=`Task #${task.task_code} is currently active. <a href="#" id="clisha-deactivate">Click here</a>  to  deactivate the task `;
    }
});

function activateTask(task) {
    let taskId = document.querySelector('#task-code-ied7yghfubj'),
        taskPoint = document.querySelector('#task-point-askjdcn'),
        taskSeach = document.querySelector('#task-search-idhfonksdx'),
        taskStep = document.querySelector('#task-step-djcfhbfcuvjbn'),
        taskDescription = document.querySelector('#task-description-udhjcgbjshbdx');

    taskActive.style.display = "flex";
    taskInactive.style.display = "none";
    taskId.innerHTML = `${task.task_code}`; 
    if(task.task_type == 'google_search'){
        document.querySelector('#clisha-task-search').style.display = 'flex';
        taskPoint.innerHTML = `${task.points}`;
        taskSeach.innerHTML = `${JSON.parse(task.google_search).search_phrase}`;
    }

    if(task.task_type == 'journey'){
        document.querySelector('#clisha-task-step').style.display = 'flex';
        document.querySelector('#clisha-task-detail').style.display = 'flex';
        taskStep.innerHTML = `Step 1 of ${task.journey.length}`;
        taskDescription.innerHTML = 'Expectoo Developers';
    }
}

taskUrl.addEventListener('click', function () {
    let baseUrl =  "https://clisha-stagging.netlify.app/dashboard/task";
    chrome.tabs.create({ url: baseUrl });
})

deactivateButton.addEventListener('click', function () {
    chrome.storage.sync.clear(function() {
        
        taskActive.style.display = "none";
        taskInactive.style.display = "flex";
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

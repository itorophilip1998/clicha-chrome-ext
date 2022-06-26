console.log('Popup Page Running');


let popDetail =  document.querySelector("#popInfo"),
    taskUrl = document.querySelector('#clisha-task'),
    deactivateButton =  document.querySelector('#clisha-deactivate');

    
// Action on Popup 
chrome.storage.sync.get('task', (item) => {
    console.log(item, 'Available')
    if (Object.keys(item).length) {
        let task = item.task;
       popDetail.innerHTML=`Task #${task.task_code} is currently active. <a href="#" id="clisha-deactivate">Click here</a>  to  deactivate the task `;
    }
});


if(taskUrl){
    taskUrl.addEventListener('click', function () {
        let baseUrl =  "https://clisha-stagging.netlify.app/dashboard/task";
        chrome.tabs.create({ url: baseUrl });
    })
}

if(deactivateButton){
    deactivateButton.addEventListener('click', function () {
        chrome.storage.sync.clear(function() {
           popDetail.innerHTML=`No active task <a href="#" id="clisha-task">click here</a>  to get and activate a task`;
            var error = chrome.runtime.lastError;
            if (error) console.log(error); throw error;
        });
    
    })
}

chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => { 
    let task = message.task;
    if(task) popDetail.innerHTML=`Task #${task.task_code} is currently active. <a href="#" id="clisha-deactivate">Click here</a>  to  deactivate the task `;
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

console.log("Extention Started Successfully");

const baseUrl = 'https://shielded-savannah-41389.herokuapp.com/api';


chrome.tabs.onActivated.addListener( function(activeInfo){
    setTimeout(()=> {
        chrome.tabs.get(activeInfo.tabId, function(tab){
            url = tab.url;
            if(url.includes('tk=') && url.includes('cd=')){
                chrome.storage.sync.get('task_active', (item) =>{
                    url = url.split('?');
                    if( Object.keys(item).length == 0 && Array.isArray(url) 
                        && url.length > 0) {
                        let query = parseQueryParam(url[1]);
                        getTaskDetails(query) 
                    }else{
                        reloadExtension();
                    }
                });
            }
        }); 
    }, 2000)
});


function parseQueryParam(url) {
    var query = {};
    var pairs = (url[0] === '?' ? url.substr(1) : url).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}  

function getTaskDetails(query){
    fetch(`${baseUrl}/task/${query.tk}?code=${query.cd}`)
        .then(response => response.json())
        .then((data) =>{
            let task = data.data;
            if(data.status) {
                chrome.storage.sync.set({ task_active: true,task: task}, function(items){
                    console.log('Task Activated')
                    chrome.tabs.query({active: true,currentWindow: true}, function(tabs){  		  
                        chrome.tabs.sendMessage(tabs[0].id, {task: task}, function(response) { 			}); 		
                    });
                    let timer = (task.task_type == 'google_search') ? 25
                                : (task.task_type == 'google_search') ? 60 : 10;
                    chrome.alarms.create('deactivat÷eTask', { delayInMinutes: timer } );
                }); 
            }
        })
        .catch(err => { console.error(err); throw err; } );
}

chrome.alarms.onAlarm.addListener(function(alarm) {
    deactivateExtensionTask();
    return true;
});
 
function deactivateExtensionTask(){
    chrome.storage.sync.clear(function() {
        reloadExtension()
        var error = chrome.runtime.lastError;
        if (error) console.error(error); 
    });
}
 
function reloadExtension(){
    console.log('Reload Extenion Refreshing ')
    chrome.runtime.reload()
}

chrome.runtime.onMessage.addListener( function(request, sender) {
   
    if(request.reload == "true") reloadExtension()
    return true;
});
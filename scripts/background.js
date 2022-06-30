console.log("Background Extention Runing");

const baseUrl = 'https://shielded-savannah-41389.herokuapp.com/api';


chrome.tabs.onActivated.addListener( function(activeInfo){
    chrome.tabs.get(activeInfo.tabId, function(tab){
        url = tab.url;
        if(url.includes('tk=') && url.includes('cd=')){
            chrome.storage.sync.get('task_active', (item) =>{
                url = url.split('?');
                if( Object.keys(item).length == 0 && Array.isArray(url) 
                    && url.length > 0) {
                    let query = parseQueryParam(url[1]);
                    getTaskDetails(query) 
                }
            });
        }
    }); 
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
            if(data.status) {
                chrome.storage.sync.set({ task_active: true,task: data.data}, function(items){
                    console.log('Task Activated', data.data);
                    chrome.tabs.query({active: true,currentWindow: true}, function(tabs){  		  
                        chrome.tabs.sendMessage(tabs[0].id, {task: data.data}, function(response) { 			}); 		
                    });

                    chrome.alarms.create('deactivateTask', { delayInMinutes: 25 } )
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
        chrome.runtime.reload()
        var error = chrome.runtime.lastError;
        if (error) console.error(error); 
    });
}

chrome.runtime.onMessage.addListener( function(request, sender) {
    console.log('Background Refreshing ',request)
    if(request.reload == "true") chrome.runtime.reload()
    return true;
});
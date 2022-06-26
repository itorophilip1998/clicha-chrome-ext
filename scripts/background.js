console.log("Background Extention Runing");

const baseUrl = 'https://shielded-savannah-41389.herokuapp.com/api';


chrome.tabs.onActivated.addListener( function(activeInfo){
    console.log(activeInfo);
    chrome.storage.sync.get('task_active', (item) =>{
        if( Object.keys(item).length == 0) {
            chrome.tabs.get(activeInfo.tabId, function(tab){
                url = tab.url;
                url = url.split('?');
                if(Array.isArray(url) && url.length > 0){
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
                    console.log('Task Activated');
                    chrome.tabs.query({active: true,currentWindow: true}, function(tabs){  		  
                        chrome.tabs.sendMessage(tabs[0].id, {action: data.data}, function(response) { 			}); 		
                    });
                }); 
            }
        })
        .catch(err => { console.error(err); throw err; } );
}

// Run Task
chrome.storage.sync.get('task', (item) => {
    if (Object.keys(item).length) {
        console.log('Task Available');
        setTimeout(()=> {
            deactivateExtensionTask();
        }, 60 * 1000);
    }
});
 
function deactivateExtensionTask(){
    chrome.storage.sync.clear(function() {
        console.log('Task Deactivated');
        var error = chrome.runtime.lastError;
        if (error) console.error(error); 
    });
}
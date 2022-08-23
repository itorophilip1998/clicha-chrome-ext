console.log("Extention Started Successfully");

const mode = 'CLIENT';
const baseUrl = (mode == 'CLIENT') ? 'https://clisha-client-server.herokuapp.com/api'
                    : 'https://clisha-dev-server.herokuapp.com/api' ;

chrome.tabs.onActivated.addListener( function(activeInfo){
    setTimeout(()=> {
        chrome.tabs.get(activeInfo.tabId, function(tab){
            url = (tab && tab.url) ? tab.url : false;
            if(url && url.includes('tk=') && url.includes('cd=')){
                chrome.storage.sync.get('task', (item) =>{
                    url = url.split('?');
                    if( Object.keys(item).length == 0 && Array.isArray(url) 
                        && url.length > 0) {
                        let query = parseQueryParam(url[1]);
                        getTaskDetails(query) 
                    }else{
                        // reloadExtension();
                    }
                });
            }
        });   
    }, 3000)
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
        .then((data) => {
            if(data.status) {
                let task = data.data;
                let step = (task.task_type == 'journey') ? 1: 0;
                chrome.storage.sync.set({ "task": task, "step": step}, function(items){
                    console.log('Task Activated', step,task);
                    
                    chrome.tabs.query({active: true,currentWindow: true}, function(tabs){  		  
                        chrome.tabs.sendMessage(tabs[0].id, { "task": task, "step": step}, function(response) { 			}); 		
                    });
                    let timer = (task.task_type == 'google_search') ? 25
                                : (task.task_type == 'journey') ? 60 : 10;
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
    chrome.runtime.reload()
}

chrome.runtime.onMessage.addListener( function(request, sender) {
    if(request.reload == "true") return reloadExtension()
    if (request.trackForm) return trackJourneyForm(request.trackForm)
    return true;
});

// Form Request
function trackJourneyForm(link){
    console.log('Tracking Start')
    chrome.webRequest.onSendHeaders.addListener(function(req) {
            let options = ['POST', 'PUT', 'PATCH']
            if (options.includes(req.method) && req.url == link ||  req.url == link +'/') { 
                getPageResponse(req);
            }
        },
        {urls: ["<all_urls>"]},
        ["requestHeaders"]
    ); 
}


function getPageResponse(req){
    chrome.webRequest.onHeadersReceived.addListener(function(res) {
        console.log('Staus Code ',res); 
        // if(res.method == "POST" && res.statusCode >= 200 && res.statusCode <= 204){
            chrome.tabs.query({active: true,currentWindow: true}, function(tabs){  		  
                chrome.tabs.sendMessage(tabs[0].id, { "form": true}, function(response) { 			}); 		
            });
        // }
    }, 
    {urls: [req.url]},  
    ["responseHeaders"] ); 
}
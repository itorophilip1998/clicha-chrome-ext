// console.log("Extention Started Successfully");

const mode = 'PRODUCTION';
const baseUrl = (mode == 'CLIENT') ? 'https://clisha-client-server.herokuapp.com/api' : 'https://app.clisha.me/api' ;

var formTracker = null, responseTracker = null;
chrome.tabs.onActivated.addListener( function(activeInfo){
    chrome.tabs.get(activeInfo.tabId, function(tab){
        url = (tab && tab.pendingUrl) ? tab.pendingUrl :
            (tab && tab.url) ? tab.url : false;
        if(url && url.includes('tk=') && url.includes('cd=')){
            chrome.storage.sync.get('task', (item) =>{
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
                let step = (task.task_type == 'journey') ? 1 : 0;

                chrome.storage.sync.set({ "task": task, "step": step}, function(items){
                    // console.log('Task Activated', step,task);
                    chrome.tabs.query({active: true,currentWindow: true}, function(tabs){  		  
                        chrome.tabs.sendMessage(tabs[0].id, { "task": task, "step": step}, function(response) { 			}); 		
                    });

                    let timer = (task.task_type == 'google_search') ? 20
                                : (task.task_type == 'journey' || task.task_type == 'search_journey') ? 40 : 10;

                                
                    chrome.alarms.create('deactivateTask', { delayInMinutes: timer } );
                }); 
            }
        })
    .catch(err => { ; throw err; } );
}

chrome.alarms.onAlarm.addListener(function(alarm) {
    deactivateExtensionTask(); 
    return true;
});
 
function deactivateExtensionTask(){
    chrome.webRequest.onSendHeaders.removeListener(formTracker);
    chrome.webRequest.onSendHeaders.removeListener(responseTracker); 
    chrome.storage.sync.clear(function() {
        reloadExtension()
        var error = chrome.runtime.lastError;
        if (error) throw error
    });
}
 
function reloadExtension(){
    chrome.runtime.reload()
}

chrome.runtime.onMessage.addListener( function(request, sender) {
    if(request.reload == "true") return reloadExtension()
    if (request.trackForm) return trackJourneyForm(request.trackForm)
    if(request.video == "vid_completed") return videoCompleted();
    return true;
});

//Send Video Completion Message
function videoCompleted(){
    setTimeout(() => {
        chrome.tabs.query({active: true,currentWindow: true}, function(tabs){  		  
            chrome.tabs.sendMessage(tabs[0].id, { "vid_completed": true }, function(response) { 			}); 		
        });
    }, 1000)
}

// Form Request
function trackJourneyForm(link){ 
    formTracker = chrome.webRequest.onSendHeaders.addListener(function(req) {
            // var domain = link.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/);
            var domain = link.split('/');
            domain = domain[0]+'//'+domain[2];
            let options = ['POST', 'PUT', 'PATCH'],
                links = [link , link +'/'];
            // console.log(domain, link);
            if(options.includes(req.method) && (links.includes(req.url)  || req.url.includes(domain))) { 
                // console.log('Form Submitted');
                getPageResponse(req);
            }
        },
        {urls: ["<all_urls>"]},
        ["requestHeaders"]
    ); 
} 


function getPageResponse(req){  
    // console.log('Waiting for response')
    responseTracker = chrome.webRequest.onHeadersReceived.addListener(function(res) {
        if(res.method == "POST" && res.statusCode >= 200 && res.statusCode <= 204){
            chrome.tabs.query({active: true,currentWindow: true}, function(tabs){  		  
                chrome.tabs.sendMessage(tabs[0].id, { "form": true}, function(response) { 			}); 		
            });
        }
    }, 
    {urls: [req.url]},  
    ["responseHeaders"] ); 
}

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
    // console.log('Mesage Recieveed', message)
      if (message == 'version') {
        sendResponse({
          type: 'success', version: '1.0.1'
        });
        return true;
      }
      const sources = message.sources;
      const tab = sender.tab;
      chrome.desktopCapture.chooseDesktopMedia(sources, tab, streamId => {
        if (!streamId) {
          sendResponse({
            type: 'error',  message: 'Failed to get stream ID'
          });
        } else {
          sendResponse({
            type: 'success', streamId: streamId
          });
        }
      });
      return true;
    }
); 

 
console.log("Background Extention Runing");

const baseUrl = 'https://shielded-savannah-41389.herokuapp.com/api';



function parseQueryParam(url) {
    var query = {};
    var pairs = (url[0] === '?' ? url.substr(1) : url).split('&');
    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
    }
    return query;
}  

function getTaskDetails(taskId){
    fetch(`${baseUrl}//task/${taskId}`)
        .then(response => response.json())
        .then((data) =>{
            if(data.status) {
                console.log('Task Loaded');
                chrome.storage.sync.set({ task_active: true,task: data.data}, function(items){
                }); 
            }
        })
        .catch(err => { console.error(err); throw err; } );
}

chrome.tabs.onActivated.addListener( function(activeInfo){
    chrome.storage.sync.get('task_active', (item) =>{
        // console.log(item, Object.keys(item).length); 
        if( Object.keys(item).length == 0) {
            chrome.tabs.get(activeInfo.tabId, function(tab){
                url = tab.url;
                url = url.split('?');
                if(Array.isArray(url) && url.length > 0){
                    console.log('Activating Task', url[1]);
                    let query = parseQueryParam(url[1]);
                    getTaskDetails(query.tk)
                }
            }); 
        }
    });
});



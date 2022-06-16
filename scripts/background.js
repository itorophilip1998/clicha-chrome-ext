console.log("Background Extention Runing");


const baseUrl = 'https://shielded-savannah-41389.herokuapp.com/api',
    code  = ['7e6dtw78egubdihisudjxhbijskhduhjnfc', 'rtyfghvd6tygsdyghbdghdcghjbhjdbcjhnd', 'ws6d7tygvwsf7yduhsudghjbduhcbj']

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
            console.log(data.data);
            if(data.status) {
                chrome.storage.sync.set( data.data, function(item){
                   console.log(item);
                }); 
            }
        })
        .catch(err => { console.error(err); throw err; } );
}

chrome.tabs.onActivated.addListener( function(activeInfo){
    chrome.tabs.get(activeInfo.tabId, function(tab){
        // Get Tab Url
        url = tab.url;
        url = url.split('?');
        let query = parseQueryParam(url[1]);

        // Confirm if Url include Clisha code
        if(code.includes(query.cd)){ 
            console.log('Task activated for ', query.tk); 
            getTaskDetails(query.tk)
        }
    }); 
});


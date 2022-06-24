console.log('Popup Page Running');

// Action on Popup 
document.querySelector('#clisha-task').addEventListener('click', function () {
    let baseUrl =  "https://clisha-stagging.netlify.app/dashboard/task";
    chrome.tabs.create({ url: baseUrl });

    // chrome.tabs.query({ currentWindow : true, active : true }, function (tabs) {
    //     let activeTab = tabs[0];
    //     console.log('Sending PopUp message');
    //     chrome.tabs.sendMessage(activeTab.id, { command: 'openModal' });
    // })
 })

// //  
// chrome.tabs.query({ currentWindow : true, active : true }, function (tabs) {
//     let activeTab = tabs[0];
//     let domain = activeTab.url.replace('http://', '').replace('https://', '').replace('www.', '').split(/[/?#]/)[0]
//     chrome.tabs.sendMessage( { command: 'fetch', data: {domain} }, (response) => {
//         console.log(response)
//     });
// })
chrome.storage.sync.get('task', (item) => {
    
});
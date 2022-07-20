console.log('Script Loaded  ');
function state() { console.log("State Changed!"); }
var player  = document.getElementsByTagName('iframe')[0];
console.log('YT >>>>>>>>>>>>>',player.contentDocument);
player.addEventListener("onClick", state);
console.log("Started!");
function state() { console.log("State Changed!"); }
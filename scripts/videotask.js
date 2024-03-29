
// window.onload = function () {

    var videoTask, taskStep, videoJourney;
    var video = null,   
         tracker = document.querySelector('div.clisha-vid-tracker'), 
        _duration = 0,  watchPer, 
        _watched = new Array(0);
        _reportedpercent = false;
 
    var  mainUrl = window.parent.location;
   
    chrome.storage.sync.get(null, (item) => {
        if (Object.keys(item).length) {
            videoTask = item.task;
            taskStep = item.step;
            // if(mainUrl.href) console.log('Parent ', mainUrl.href);
            if(videoTask.task_type == "search_journey" && taskStep == 0) taskStep = 1; 
            if(videoTask.task_type == "journey" || videoTask.task_type == "search_journey")  startVideoTask();
        }
    });

    // Sync Task with Backround 
    chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => { 
        if(message.vid_completed)  return true;
        videoTask = message.task;
        taskStep = message.step; 
        if(videoTask.task_type == "journey" || videoTask.task_type == "search_journey") startVideoTask();
        return true; 
    });

    function startVideoTask(){
        videoJourney = videoTask.journey[taskStep - 1];

        if(videoJourney && videoJourney.link_type == "video"){
            video = document.getElementsByTagName("video")[0]
            // console.log('Video FRAME API AT >>>>>>>>>>>>  ', window.location.href);
            if(video){
                let trackerElem = document.createElement('div');
                trackerElem.classList.add('clisha-vid-tracker');  
                trackerElem.innerHTML = `0%`;  //
                document.body.append(trackerElem);
 
                Array.prototype.resize = function(newSize, defaultValue) {
                    while(newSize > this.length)
                        this.push(defaultValue);
                    this.length = newSize; 
                } 
                video.pause();

                video.addEventListener('playing', function(e){
                    getVideoDuration();  
                    if (video.duration > 15) video.addEventListener('timeupdate',timeupdate, false);
                });
            } 
        }
    }

    function getVideoDuration() { 
        // get the duration in seconds, rounding up, to size the array
        _duration = parseInt(roundUp(video.duration,1));
        
        _watched.resize(_duration,0);
        sum = _watched.reduce(function(acc, val) {return acc + val;}, 0);
    }

    function roundUp(num, precision) {
        return Math.ceil(num * precision) / precision;
    }  

    function timeupdate() {
        if (document.visibilityState !== 'visible') video.pause();
        currentTime = parseInt(video.currentTime);
        _watched[currentTime] = 1;
        var percent = (_duration > 200) ? (_duration * .40): (_duration * .50);
        // sum the value of the array (add up the "_watched" seconds)
        var sum = _watched.reduce(function(acc, val) {return acc + val;}, 0),
            percentage = 80;
        watchPer = (sum / _duration) * percentage;
        
        if(document.querySelectorAll('div.clisha-vid-tracker').length){
            // Update tracker
            tracker = document.querySelector('div.clisha-vid-tracker');
            tracker.innerHTML = `${roundUp(watchPer,1)}%`;
        }else{
            // Remove old ones
            document.querySelectorAll('div.clisha-vid-tracker').forEach(function(el) {
                el.style.display = 'none';
            });
            // Add Current tracker
            let trackerElem = document.createElement('div');
            trackerElem.classList.add('clisha-vid-tracker');  
            trackerElem.innerHTML = `${roundUp(watchPer,1)}%`;  //
            document.body.append(trackerElem);
        }

        // Complete Step 
        if ((sum >= percent) && !_reportedpercent) {
            _reportedpercent = true; 
            chrome.runtime.sendMessage({video: "vid_completed"}, function(response) { });
        }
    }
     
    function  handleVideoCompleted(){ 
        let completed = (videoJourney.link.includes('?')) ? '&completed=vid' : '?completed=vid' ;
        window.parent.location = videoJourney.link+completed
    }

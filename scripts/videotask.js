
// let vid, _watched, 
//     duration , _reportedpercent, 
//     videotTime ;

// "matches": [ "*://*.youtube.com/*" ],
// chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => { 
//     console.log('Video Task Message Received', message);
//     return true
// });
window.onload = function () {

    chrome.storage.sync.get(null, (item) => {
            
        if (Object.keys(item).length) {
            videoTask = item.task;
            taskStep = item.step;
            if(videoTask.task_type == "journey")  startVideoTask()
        }

    });

    let videoTask, taskStep, videoJourney;
    let video = null,  
        _duration = 0,
        _watched = new Array(0);
        _reportedpercent = false;
    

   
    function startVideoTask(){
        videoJourney = videoTask.journey[taskStep - 1];
        const currentUrl = window.parent.location;

        if(videoJourney.link_type == "video"){
            video = document.getElementsByTagName("video")[0]
            console.log('Video FRAME API AT >>>>>>>>>>>>', video)
            if(video){
                video.onloadedmetadata = function() {
                    Array.prototype.resize = function(newSize, defaultValue) {
                        while(newSize > this.length)
                            this.push(defaultValue);
                        this.length = newSize; 
                    }
                    getVideoDuration()
                    video.addEventListener('timeupdate',timeupdate, false)
                }
            } 
        }
    }

    function getVideoDuration() {
        console.log('Duration',video)
        // get the duration in seconds, rounding up, to size the array
        _duration = parseInt(roundUp(video.duration,1));
        console.log("resizing arrary to " + _duration + " seconds.");
        _watched.resize(_duration,0);
        sum = _watched.reduce(function(acc, val) {return acc + val;}, 0);
    }

    function roundUp(num, precision) {
        return Math.ceil(num * precision) / precision
    }  

    function timeupdate() {
        currentTime = parseInt(video.currentTime);
        _watched[currentTime] = 1;
        var percent = (_duration > 300) ? (_duration * .2): (_duration * .26);
        // sum the value of the array (add up the "_watched" seconds)
        var sum = _watched.reduce(function(acc, val) {return acc + val;}, 0);
       
        if ((sum >= percent) && !_reportedpercent) {
            _reportedpercent = true;
            console.log("Video Watched. User can now Continue...")
            handleVideoCompleted();
            console.log('Deal Done');
        }
    }

    function  handleVideoCompleted(){ 
        console.log('Handle Next Journey ');
        // let completed = (window.parent.location.href.includes('?')) ? '&completed=vid' : '?completed=vid' ;
        console.log('Completed')
        window.parent.location = videoJourney.link+'?completed=vid'
    }
}

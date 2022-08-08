
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
    let video = null,   tracker = 0, 
        _duration = 0,
        _watched = new Array(0);
        _reportedpercent = false;
    

   
    function startVideoTask(){
        videoJourney = videoTask.journey[taskStep - 1];
        const currentUrl = window.parent.location;

        if(videoJourney.link_type == "video"){
            video = document.getElementsByTagName("video")[0]
            console.log('Video FRAME API AT >>>>>>>>>>>>', window.location.href)
            if(video){
                console.log('Can Create >>>>>>>>>>', video)
                if(!document.querySelector('.clisha-vid-tracker')){
                    let trackerElem = document.createElement('div');
                    trackerElem.classList.add('clisha-vid-tracker');  
                    trackerElem.innerHTML = '0%';  //
                    document.body.append(trackerElem);
                } 
                // video.onloadedmetadata = function() {
                //     console.log('Sane Thonng')
                //     Array.prototype.resize = function(newSize, defaultValue) {
                //         while(newSize > this.length)
                //             this.push(defaultValue);
                //         this.length = newSize; 
                //     }

                //     video.addEventListener('timeupdate',timeupdate, false);

                //     getVideoDuration()
                // }

                video.addEventListener('loadedmetadata', function(e){
                    console.log('Sane Thonng  2',e)
                    Array.prototype.resize = function(newSize, defaultValue) {
                        while(newSize > this.length)
                            this.push(defaultValue);
                        this.length = newSize; 
                    }

                    video.addEventListener('timeupdate',timeupdate, false);

                    getVideoDuration()
                });
            } 
        }
    }

    function getVideoDuration() {
        console.log('Duration');
        // get the duration in seconds, rounding up, to size the array
        _duration = parseInt(roundUp(video.duration,1));
       
        _watched.resize(_duration,0);
        sum = _watched.reduce(function(acc, val) {return acc + val;}, 0);
        video.addEventListener('timeupdate',timeupdate, false);
        console.log(sum + " Resizing arrary to " + _duration + " seconds.");
    }

    function roundUp(num, precision) {
        return Math.ceil(num * precision) / precision
    }  

    function timeupdate() {
        currentTime = parseInt(video.currentTime);
        _watched[currentTime] = 1;
        var percent = (_duration > 300) ? (_duration * .4): (_duration * .45);
        // sum the value of the array (add up the "_watched" seconds)
        var sum = _watched.reduce(function(acc, val) {return acc + val;}, 0),
            percentage = 80;
        var watchPer = (sum / _duration) * percentage;
        console.log('Watched Percentage ',roundUp(watchPer,1));
        if(document.querySelector('.clisha-vid-tracker')){
            tracker = document.querySelector('.clisha-vid-tracker');
            tracker.innerHTML = `${roundUp(watchPer,1)}%`;
        }
        console.log(tracker, ' TO ', percent)
        
        if ((sum >= percent) && !_reportedpercent) {
            _reportedpercent = true;
            console.log("Video Watched. User can now Continue...")
            handleVideoCompleted();
        }
    }
    
    function  handleVideoCompleted(){ 
        console.log('Handle Next Journey ');
        let completed = (videoJourney.link.includes('?')) ? '&completed=vid' : '?completed=vid' ;
        window.parent.location = videoJourney.link+completed
    }

}
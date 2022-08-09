
window.onload = function () {

    let videoTask, taskStep, videoJourney;
    let video = null,   
         tracker = document.querySelector('div.clisha-vid-tracker'), 
        _duration = 0,  watchPer, 
        _watched = new Array(0);
        _reportedpercent = false;

    chrome.storage.sync.get(null, (item) => {
            
        if (Object.keys(item).length) {
            videoTask = item.task;
            taskStep = item.step;
            // console.log('Task Step', taskStep); s
            if(videoTask.task_type == "journey") {
                if(taskStep == 1) {
                    console.log('Waiting');
                    setTimeout(() => {startVideoTask();}, 5 * 1000) ;
                } else{
                    startVideoTask();
                }
            }
        }

    });
    
   
    function startVideoTask(){
        videoJourney = videoTask.journey[taskStep - 1];
        const currentUrl = location;

        if(videoJourney.link_type == "video"){
            video = document.getElementsByTagName("video")[0]
            console.log('Video FRAME API AT >>>>>>>>>>>>', window.location.href)
            if(video){
                console.log('Can Create >>>>>>>>>>', video)
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

                    video.addEventListener('timeupdate',timeupdate, false);
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
        // video.addEventListener('timeupdate',timeupdate, false);
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
        watchPer = (sum / _duration) * percentage;
        console.log('Watched Percentage ',roundUp(watchPer,1));
        
        if(document.querySelector('div.clisha-vid-tracker')){
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

        console.log(tracker);
        // Complete Step
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
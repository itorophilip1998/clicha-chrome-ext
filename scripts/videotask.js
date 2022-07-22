
// let vid, watched, 
//     duration , reportedpercent, 
//     videotTime ;

// "matches": [ "*://*.youtube.com/*" ],
window.onload = function () {
    let videoTask, taskStep, currentJourney;
    let video = null,  
        duration = 0,
        watched = new Array(0);
        reportedpercent = false;
    // chrome.storage.sync.get(null, (item) => {
    //     console.log('Task Available')
    //     if (Object.keys(item).length) {
    //         videoTask = item.task;
    //         taskStep = item.step;

    //         if(videoTask.task_type == "journey")  startVideoTask()
    //     }

    // });

    chrome.runtime.onMessage.addListener( (message, sender, sendResponse) => { 
        console.log('Video TaskMessage Received', message)

    })
    function startVideoTask(){
        currentJourney = videoTask.journey[taskStep - 1];
        const currentUrl = window.location;
        // || currentUrl.href+'/' == currentJourney.link || currentJourney.link.includes(currentUrl.href)
        console.log('Task Presentation',currentUrl.href, (currentJourney.link));
 
        if(currentJourney.link_type == "video"){
            console.log('Video FRAME API AT >>>>>>>>>>>>', location.href)
            video = document.getElementsByTagName("video")[0]
            if(video){
                console.log('Video   <<<>>>',video.readyState);
                video.onloadedmetadata = function() {
                    Array.prototype.resize = function(newSize, defaultValue) {
                        while(newSize > this.length)
                            this.push(defaultValue);
                        this.length = newSize; 
                    }
                    getDuration()
                    video.addEventListener('timeupdate',timeupdate, false)
                }
            } 
        }
    }

    function getDuration() {
        console.log('Duration',video)
        // get the duration in seconds, rounding up, to size the array
        duration = parseInt(roundUp(video.duration,1));
        console.log("resizing arrary to " + duration + " seconds.");
        watched.resize(duration,0);
        sum = watched.reduce(function(acc, val) {return acc + val;}, 0);
    }

    function roundUp(num, precision) {
        return Math.ceil(num * precision) / precision
    }  

    function timeupdate() {
        currentTime = parseInt(video.currentTime);
        watched[currentTime] = 1;
        // console.log(watched); 
        var percent = (duration > 300) ? (duration * .7): (duration * .8);
        // sum the value of the array (add up the "watched" seconds)
        var sum = watched.reduce(function(acc, val) {return acc + val;}, 0);
        // console.log(sum, sum >= (duration * .8));
        if ((sum >= percent) && !reportedpercent) {
            reportedpercent = true;
            console.log("Video watched. User can now Continue...")
            handleVideoCompleted()
        }
    }

    function  handleVideoCompleted(){
        console.log('Handle Next Journey ',currentJourney);
        // if(step == task.journey.length) {
        //     // completeExtensionTask(task);
        // }else{ 
            let nextstep = `/templates/journey_nextstep.html`;
            fetch(chrome.runtime.getURL(nextstep))
                .then(r => r.text())
                .then(html => {
                if( document.querySelector('#clisha-answer'))document.querySelector('#clisha-answer').style.display = "none"
                document.body.insertAdjacentHTML('beforeend', html);
                let step_info = document.querySelector('#next-step-info');
                step_info.innerHTML = `Whent you are done,  and click  ${videoTask.journey[taskStep].description} or  visit "${videoTask.journey[taskStep].link}" from the url bar to continue.`
                active_modal = document.querySelector('#clishaModelNextStep')
                active_modal.classList.add("clisha_modal_open");
                
                chrome.storage.sync.set(({ "step": taskStep + 1 }));
            }); 
        // } 
    }
     
      
}


console.log('Modal Extension Loaded')
document.body.addEventListener( 'click', function ( e ) {
    console.log('Modal Event ',e.target.id);
    if(e.target && e.target.id == 'clisha_close-primary'){
        closeActiveModal()
    }

    if(e.target && e.target.id == 'task-deactivate' ) {
        handleDeactivateModal();
    };

    if(e.target && e.target.id == 'clisha-answer') {
        active_modal = document.querySelector('#clishaModelMulti')
        active_modal.classList.add("clisha_modal_open")
        // $('#clishaModelMulti').modal('show');;
        // active_modal.classList.remove("clisha_modal_close")  
    }

    if(e.target && e.target.id == 'clisha-next-step') {
        active_modal.classList.add("clisha_modal_open");
        //   window.location.href = task.journey[step].link;
    }

    if(e.target && e.target.id == 'close_modal_btn') closeActiveModal()

    if(e.target && e.target.name == 'task-option')  prepareAnswer();
    

    if(e.target && e.target.id == 'clisha-submit-answer'){
        console.log(task.interaction);
        let choice = document.querySelector('input[name="task-option"]:checked').value;
        let answer = task.interaction.answer;
        // $('#clishaModelMulti').modal('hide');  
        closeActiveModal()
        
        if(choice == answer){ 
            setTimeout(() => { 
                if (task.task_type == "google_search"){
                    completeExtensionTask(task);
                } else if(task.task_type == "journey"){
                    handleNextJourney();
                }
            },2000)
        }else{
            showModal(2, { error: true, head: `You have clicked on the wrong answer! Please select another task to continue "`});
            handleDeactivateModal();
            setTimeout(() => {
                window.location.href = 'https://clisha-stagging.netlify.app/dashboard/task';
            },4000)
        }

    }  

} ); 

function closeActiveModal(){
    // active_modal.classList.add("clisha_modal_close")  
    active_modal.classList.remove("clisha_modal_open")
}

function handleDeactivateModal() {
    console.log('Deactivating Task from Modal')
    chrome.storage.sync.clear(function() {
        chrome.runtime.sendMessage( { reload: 'true' }, (response) => {  
            // active_modal.classList.add("clisha_modal_close")  
            active_modal.classList.remove("clisha_modal_open")
            // if($('#clishaModelId1'))  $('#clishaModelId1').modal('hide');  
            // if($('#clishaModelId2'))  $('#clishaModelId2').modal('hide');  
        });
        var error = chrome.runtime.lastError;
        if (error) console.error(error);  throw error; 
    });
} 

function prepareAnswer(){
    let submit = document.querySelector('#clisha-submit-answer');
    if(submit.disabled == true) {
        submit.disabled = false;
        chrome.storage.sync.get('task', (item) => {
            if (Object.keys(item).length) {
                task = item.task;
            }
        });
    }
}

 function handleNextJourney(){
    if(step == task.journey.length) {
        completeExtensionTask(task);
    }else{
        let nextstep = `/templates/journey_nextstep.html`;
        fetch(chrome.runtime.getURL(nextstep))
            .then(r => r.text())
            .then(html => {
            if( document.querySelector('#clisha-answer'))document.querySelector('#clisha-answer').style.display = "none"
            document.body.insertAdjacentHTML('beforeend', html);
            let step_info = document.querySelector('#next-step-info');
            step_info.innerHTML = `Whent you are done,  and click  ${task.journey[step].description} or  visit "${task.journey[step].link}" from the url bar to continue.`
            active_modal = document.querySelector('#clishaModelNextStep')
            active_modal.classList.add("clisha_modal_open");
            
            chrome.storage.sync.set(({ "step": step + 1 }));
        }); 
    } 
} 

// const nextJourney = handleNextJourney();

let 
    frame, vid, watched, 
    duration , reportedpercent, 
    videotTime ;

function initiateJourneyVideo(){
    console.log('Video Script Started');
    vid = document.getElementsByTagName("video")[0];
    duration = 0; 
    watched = new Array(0);
    reportedpercent = false;
    
    if(vid){ 
        console.log('Journey Video Started',vid);
        handleNextJourney();
        vid.addEventListener('loadedmetadata', function(e){
            var dimensions = [video.videoWidth, video.videoHeight];
            alert(dimensions);

            Array.prototype.resize = function(newSize, defaultValue) {
                while(newSize > this.length)
                    this.push(defaultValue);
                this.length = newSize; 
            }

            getDuration();

            vid.addEventListener('timeupdate',timeupdate, false)
        })
    }
}

function startVideoPlayer(){

    getDuration();

  
}
 
function formatISODate(youtube_time){
    array = youtube_time.match(/(\d+)(?=[MHS])/ig)||[]; 
    var formatted = array.map(function(item){
        if(item.length<2) return '0'+item;
        return item;
    }).join(':');
    return formatted;
}


function roundUp(num, precision) {
    return Math.ceil(num * precision) / precision
} 

function formatSeconds(dur){
    a = dur.split(':');
    return s = (+a[0]) * 60 + (+a[1])
    return(s- (s%=60)) / 60 + (9 < s ? ':'  : ':0'  ) + s
}

function frameupdate(){
    videotTime = 0;
    duration = formatSeconds(duration)
    console.log('Frame Clicked', duration);
    setInterval( () => {
        videotTime++
        if ((videotTime >= (duration * .8)) && !reportedpercent) {
            reportedpercent = true;
            console.log("Video watched. User can now Continue...")
            handleNextJourney()
        }
    }, 1000);
}

function timeupdate() {
    currentTime = parseInt(vid.currentTime);
    watched[currentTime] = 1;
    console.log(watched);

    // sum the value of the array (add up the "watched" seconds)
    var sum = watched.reduce(function(acc, val) {return acc + val;}, 0);
    
    if ((sum >= (duration * .8)) && !reportedpercent) {
        reportedpercent = true;
        console.log("Video watched. User can now Continue...")
        handleNextJourney()
    }
}

function getDuration() {
    // get the duration in seconds, rounding up, to size the array
    duration = parseInt(roundUp(vid.duration,1));
    console.log("resizing arrary to " + duration + " seconds.");
    watched.resize(duration,0)
    sum = watched.reduce(function(acc, val) {return acc + val;}, 0);
}

function onYouTubeIframeAPIReady() {
    console.log('--- The YT player API is ready from content script! ---');
}
    

function youtubeVideoTask(){
    frame = document.getElementsByTagName('iframe')[1]; 
        
    var regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
        youtube = frame.getAttribute('data-src');
    if(youtube){ 
        var match = youtube.match(regExp);
        frame.addEventListener('click', frameupdate);

        
        if (match && match[2].length == 11) {
            var youtubeUrl = "https://www.googleapis.com/youtube/v3/videos?id=" + match[2] 
            + "&key=AIzaSyBt2NoMgus5sWhWrZeG1b9kEn2saSP0wcs&part=snippet,contentDetails";
            $.ajax({
                async: false,
                type: 'GET',
                url: youtubeUrl,
                success: function(data) {
                    var youtube_time = data.items[0].contentDetails.duration;
                    duration = formatISODate(youtube_time); 
                    console.log('Duration', duration, frame);

                }
            });
        }
        return;
    }
}
    // chrome.history.search({text: '', maxResults: 10}, function(data) {
    //     data.forEach(function(page) {
    //         console.log(page.url);
    //     });
    // });

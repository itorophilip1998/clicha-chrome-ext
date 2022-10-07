
// console.log('Modal Extension Loaded');
document.body.addEventListener( 'click', function ( e ) {
    console.log('Modal Event ',e.target, document.querySelectorAll('[id=clisha-submit-answer]')); 
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
        let choice = document.querySelector('input[name="task-option"]:checked').value,
            answer= null;
        if (task.task_type == "google_search"){
            answer = task.interaction.answer;
        } else if(task.task_type == "journey" || task.task_type == "search_journey"){
            answer = currentJourney.step_interaction.answer;
        }

        closeActiveModal();
 
        // if(choice == answer){ 
        //     setTimeout(() => { 
        //         if (task.task_type == "google_search"){
        //             completeExtensionTask(task);
        //         } else if(task.task_type == "journey" || task.task_type == "search_journey" ){
        //             handleNextJourney();
        //         }
        //     },2000)
        // }else{
        //     // showModal(2, { error: true, head: `You have clicked on the wrong answer! Please select another task to continue.`});
            
        //     setTimeout(() => {  
        //         handleDeactivateModal();
        //         window.location.href = `${dashboardUrl}reward?t=${task.id}&p=${task.points}&status=failed`;
        //     },3000)
        // }

    }  

} );  

function closeActiveModal(){
    // active_modal.classList.add("clisha_modal_close")  
    active_modal.classList.remove("clisha_modal_open")
}

function handleDeactivateModal() {
    chrome.storage.sync.clear(function() {
        chrome.runtime.sendMessage( { reload: 'true' }, (response) => {  
            active_modal.classList.remove("clisha_modal_open");
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
            step_info.innerHTML = `When you are done, click on  <span class="clisha_text_secondary"> ${task.journey[step].description} </span> on this page to continue.`
            active_modal = document.querySelector('#clishaModelNextStep')
            active_modal.classList.add("clisha_modal_open");
            
            chrome.storage.sync.set(({ "step": step + 1 }));
        }); 
    } 
} 

// const nextJourney = handleNextJourney();onloadedmetadata

let 
    frame, vid, watched, 
    duration , reportedpercent, 
    videotTime ;

function initiateJourneyVideo(){
    console.log('Video Script Started');
    vid = document.getElementsByTagName('video')[0];
    
    duration = 0; 
    watched = new Array(0);
    reportedpercent = false;
     
    if(vid){  
        console.log('Journey Video in Main Stage');
        let trackerElem = document.createElement('div');
        trackerElem.classList.add('clisha-vid-tracker');  
        trackerElem.innerHTML = '0%';  //
        document.body.append(trackerElem); 

        Array.prototype.resize = function(newSize, defaultValue) {
            while(newSize > this.length)
                this.push(defaultValue);
            this.length = newSize; 
        } 
        vid.pause();

        vid.onloadedmetadata = function() {   

            getDuration();
            
            vid.addEventListener('timeupdate', timeupdate, false);
        }
    }
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

function timeupdate() {
    currentTime = parseInt(vid.currentTime);
    
    watched[currentTime] = 1;  
    // sum the value of the array (add up the "watched" seconds)
    var sum = watched.reduce(function(acc, val) {return acc + val;}, 0),
        percentage = 80;
    var watchPer = (sum / duration) * percentage; 
    // console.log(watchPer);   
    let tracker = document.querySelector('.clisha-vid-tracker');
        tracker.innerHTML = `${roundUp(watchPer,1)}%`;

    if ((sum >= (duration * percentage)) && !reportedpercent) {
        reportedpercent = true;
        console.log("Video watched. User can now Continue...")
        handleNextJourney()
    }
}

function getDuration() {
    watched.resize(duration,0)
    sum = watched.reduce(function(acc, val) {return acc + val;}, 0);
    duration = parseInt(roundUp(vid.duration,1));
}

function formatSeconds(dur){
    a = dur.split(':');
    return s = (+a[0]) * 60 + (+a[1])
    return(s- (s%=60)) / 60 + (9 < s ? ':'  : ':0'  ) + s
}

function frameupdate(){
    videotTime = 0;
    duration = formatSeconds(duration)
    setInterval( () => {
        videotTime++
        if ((videotTime >= (duration * .8)) && !reportedpercent) {
            reportedpercent = true;
            console.log("Video watched. User can now Continue...")
            handleNextJourney()
        }
    }, 1000);
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

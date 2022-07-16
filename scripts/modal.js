
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
      console.log('Go To Next PAGE NOw')
      window.location.href = task.journey[step].link;
    }

    if(e.target && e.target.id == 'close_modal_btn') closeActiveModal()

    if(e.target && e.target.name == 'task-option')  prepareAnswer();
    

    if(e.target && e.target.id == 'clisha-submit-answer'){
        let choice = document.querySelector('input[name="task-option"]:checked').value;
        let answer = task.interaction.answer;
        console.log(choice, answer);
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
    console.log('Handle Next Journey ',currentJourney);
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

let frame, vid, watched, duration , reportedpercent ;
function initiateJourneyVideo(){
    console.log('Video Script Started');
    frame = document.getElementsByTagName('iframe')[0];
    vid = document.getElementsByTagName("video")[0];
    console.log('Journey Video Started',vid ,frame)
    duration = 0; 
    watched = new Array(0);
    reportedpercent = false;
    
    if(!vid){
        console.log('No Video in Document Check Frame')
        vid = frame.contentWindow.document.getElementsByTagName('video');
    }

    Array.prototype.resize = function(newSize, defaultValue) {
        while(newSize > this.length)
            this.push(defaultValue);
        this.length = newSize;
    }

    getDuration();
    vid.addEventListener('timeupdate',timeupdate, false)
    
}

function roundUp(num, precision) {
  return Math.ceil(num * precision) / precision
} 

function timeupdate() {
    currentTime = parseInt(vid.currentTime);
    // set the current second to "1" to flag it as watched
    watched[currentTime] = 1;

    // show the array of seconds so you can track what has been watched
    // you'll note that simply looping over the same few seconds never gets
    // the user closer to the magic 80%...
    // console.log(watched);

    // sum the value of the array (add up the "watched" seconds)
    var sum = watched.reduce(function(acc, val) {return acc + val;}, 0);
 
    // take your desired action on the ?80% completion
    if ((sum >= (duration * .8)) && !reportedpercent) {
        // set reportedpercent to true so that the action is triggered once and only once
        // could also unregister the timeupdate event to avoid calling unneeded code at this point
        // vid.removeEventListener('timeupdate',timeupdate)
        reportedpercent = true;
        console.log("Video watched. User can now Continue...")
        handleNextJourney()
        // your ajax call to report progress could go here...   
    }
}

function getDuration() {
    // get the duration in seconds, rounding up, to size the array
    duration = parseInt(roundUp(vid.duration,1));
    // resize the array, defaulting entries to zero
    console.log("resizing arrary to " + duration + " seconds.");
    watched.resize(duration,0)
    sum = watched.reduce(function(acc, val) {return acc + val;}, 0);
    console.log("Duration:" + vid.duration, 'Watch Till', (duration * .9) );
}

 
function initiateJourneyForm(){
    var form = document.querySelector("form");
    if(form.checkValidity()){
        form.onsubmit = submitted.bind(form);
            console.log(form);
        function submitted(event) {
            event.preventDefault(); 
            event.submit();
            handleNextJourney()
        }
    }
}

// chrome.history.search({text: '', maxResults: 10}, function(data) {
//     data.forEach(function(page) {
//         console.log(page.url);
//     });
// });

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
            step_info.innerHTML = `Whent you are done, Find  ${task.journey[step].description} or  visit "${task.journey[step].link}" from the url bar to continue.`
            active_modal = document.querySelector('#clishaModelNextStep')
            active_modal.classList.add("clisha_modal_open");
           
            
            chrome.storage.sync.set(({ "step": step + 1 }));
        }); 
    } 
}
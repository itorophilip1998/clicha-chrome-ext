
console.log('Modal Extension Loaded')


document.body.addEventListener( 'click', function ( e ) {
    console.log('Modal Event ',e.target.id);
    if(e.target && e.target.id == 'task-deactivate' ) {
        handleDeactivateModal1();
    };

    if(e.target && e.target.id == 'clisha-answer') {
        $('#clishaModelMulti').modal('show');
    }


} );

function handleDeactivateModal1() {
    console.log('Deactivating Task from Modal')
    chrome.storage.sync.clear(function() {
        chrome.runtime.sendMessage( { reload: 'true' }, (response) => {    $('#clishaModelId1').modal('hide');  });
        var error = chrome.runtime.lastError;
        if (error) console.error(error);  throw error; 
    });
}
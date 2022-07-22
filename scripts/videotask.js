
document.addEventListener("DOMContentLoaded", function() {
});
let vid, watched, 
    duration , reportedpercent, 
    videotTime ;
console.log('DOcument STATE >>>>>>>>>>>>>>>', document.readyState)
if (document.readyState === "interactive" || document.readyState === "complete" ) {
    console.log('Video Task API >>>>>>>>>>>>')
    console.log("-----------------" )
    
    if(!vid){
        vid = document.getElementsByTagName("video")[0];
        console.log('Journey Video Started')
        duration = 0; 
        watched = new Array(0);
        reportedpercent = false;
    
        Array.prototype.resize = function(newSize, defaultValue) {
            while(newSize > this.length)
                this.push(defaultValue);
            this.length = newSize;
        }

        duration = parseInt(roundUp(vid.duration,1));
        console.log("resizing arrary to " + duration + " seconds.");
        watched.resize(duration,0)

        vid.addEventListener('timeupdate',timeupdate, false)
       
    }
    // if(currentJourney && currentJourney.link_type == "video") {
    // }
}


function startVideoPlayer(){
   
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
    // console.log(watched);

    // sum the value of the array (add up the "watched" seconds)
    var sum = watched.reduce(function(acc, val) {return acc + val;}, 0);
 
    // take your desired action on the ?80% completion
    if ((sum >= (duration * .8)) && !reportedpercent) {
        reportedpercent = true;
        console.log("Video watched. User can now Continue...")
        handleNextJourney()
    }
}

function getDuration() {
    // get the duration in seconds, rounding up, to size the array
    console.log(vid)
    duration = parseInt(roundUp(vid.duration,1));
    console.log("resizing arrary to " + duration + " seconds.");
    watched.resize(duration,0)
}

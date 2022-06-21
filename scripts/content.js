// import axios from "axios";
// import { config, keyword } from "../config";

// taskid = 728362863 & code=hw8wg238362hi2gkg
(() => {
    console.log("Extention Loaded ")
    const keyword = "hi"
    const currentUrl = window.location
    // is the user currently in the google chrome task
    if (currentUrl.href.match("https://www.google.com/")) {
        console.log("hello you are currently on the Google search bar")
        alert("hello you are currently on the Google search bar")
    }

    // check if a user is typing on the google input box
    const inputbox = document.querySelector("input")
    inputbox.addEventListener("input", (e) => {
        let usersData = e.target.value;

        // check if user type the exact keyword
        if (usersData === keyword) {
            console.log(`${usersData} is equalto ${keyword}`) 
            // visit the backend 
            axios.post("/", "data", "config").then((res) => {
                //this is going to backend
            }).catch((err) => {
                // get errors
            });
        } else {
            console.log(`Invalid keyword`) 
        }

    })
})();
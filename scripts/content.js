console.log("Extention Loaded yes 2")

const currentUrl = window.location
// is the user currently in the google chrome task
if (currentUrl.href === "https://www.google.com/") {
    console.log("hello you are currently on the Google search bar")
    alert("hello you are currently on the Google search bar")
}


// check if a user is typing on the google input box
const inputbox = document.querySelector("input")
inputbox.addEventListener("change", (e) => {
    console.log(e)
}) 
/// this is where we are going to config environment configuration files


// this is the header for getting users token and stored in the header aas config
const token = window.localStorage.getItem("token") ?? "token"
const headers = {
    headers: {
        Authorization: `bearer ${token}`
    }
};

// keywords
const keyword = window.localStorage.getItem("keyword") ?? "hello"




export default config= {
    headers,
    keyword
}
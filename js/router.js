// const route = (event) => {
//     event = event || window.event;
//     event.preventDefault();
//     window.history.pushState({}, "", event.target.href);
//     handleLocation();
// }

// const routes = {
//     404: "/pages/404.html",
//     "/": "/pages/index.html",
//     "/project" : "/pages/project.html"
// }

// const handleLocation = async () => {
//     const path = window.location.pathname;
//     const route = routes[path] || routes[404];
//     const html = await fetch(route).then((data) => data.text());
//     document.getElementById("content").innerHTML = html;
// }

// window.onpopstate = handleLocation;
// window.route = route;

// handleLocation();
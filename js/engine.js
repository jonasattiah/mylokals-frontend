const apiUrl = "http://localhost:3001/api/";
const domain = window.location.origin;

window.$t = (key) => {
  return lang[key];
};

const render = (propeties, target) => {
  let el = document.createElement(propeties.is);
  el.className = propeties.class;
  Object.keys(propeties.attr).forEach((attr) => {
    el.setAttribute(attr, propeties.attr[attr]);
  });
  el.innerHTML = propeties.body;

  target.appendChild(el);

  linkListener();

  return {
    ...propeties,
    el,
  };
};

const getFormData = (form_id) => {
  return Array.from(
    document.querySelectorAll(`#${form_id} .form-field-input`)
  ).reduce((acc, input) => {
    let value = input.value;
    if (input.getAttribute("type") === "checkbox") {
      value = input.checked ? true : false;
    }

    return {
      ...acc,
      [input.id]: value,
    };
  }, {});
};

// Todo: Move to app.js
const setCookie = (cname, cvalue, exdays = 356) => {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
};

const getCookie = (cname) => {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
};

const removeCookie = (cname) => {
  document.cookie = `${cname}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

let apiDefaults = {
  headers: {},
};

function updateOptions(options = {}) {
  const update = { ...options, body: JSON.stringify(options.body) };
  update.headers = {
    ...apiDefaults.headers,
    ...update.headers,
    Accept: "application/json",
    "Content-Type": "application/json",
    "country-locale-code": "DE",
  };
  return update;
}

function api(url, options = {}) {
  return new Promise((resolve, reject) => {
    const query = "?" + new URLSearchParams(options.query).toString();
    fetch(
      apiUrl + url + (options.query ? query : ""),
      updateOptions(options)
    ).then(async (res) => {
      if (!res.ok) {
        try {
          return reject({
            status: res.status,
            data: await res.json(),
          });
        } catch {
          return reject({
            status: res.status,
            data: null,
          });
        }
      }

      resolve({
        status: res.status,
        data: await res.json(),
      });
    });
  });
}

const stringToHTML = function (str) {
  let dom = document.createElement("div");
  dom.innerHTML = str;
  return dom;
};

const onRouteChange = async (route) => {
  let urlHash = window.location.pathname.substring(1);
  if (route) {
    urlHash = route;
  }
  const splitRoute = urlHash.split("/");
  let params = {};
  let config = null;
  let query = {};

  const links = document.querySelectorAll("[route]");
  for (let i = 0; i < links.length; i++) {
    links[i].classList.remove("active");
  }
  const linksWithRoute = document.querySelectorAll(`[route="/${urlHash}"]`);
  linksWithRoute.forEach((links) => {
    links.classList.add("active");
  });

  if (urlHash) {
    new URLSearchParams(window.location.search).forEach((item, index) => {
      query[index] = item;
    });
    routes.forEach((route) => {
      const routeArray = route.path.split("/").slice(1);
      splitRoute.forEach((r, index) => {
        if (routeArray[index] && routeArray[index].substring(0, 1) === ":") {
          params = { [routeArray[index].slice(1)]: r };
        }
        if (r === routeArray[index]) {
          config = route;
        }
      });
    });
  } else config = routes.find((r) => r.path === "/");

  if (!config) return console.error("Route not available");

  window.$route = {
    path: urlHash,
    params,
    config,
    key: config.key,
    query,
  };

  const view = templates.find((t) => t.name === config.view);
  const routeEl = document.getElementsByTagName("route")[0];
  routeEl.innerHTML = "";
  routeEl.appendChild(stringToHTML(view.template));
  document.body.scrollTop = document.documentElement.scrollTop = 0;
  await view.init();
  linkListener();
};

const changeRoute = (route) => {
  window.history.pushState({ pageTitle: "test" }, null, domain + route);
  onRouteChange();
};

const linkListener = () => {
  const links = document.querySelectorAll("[route]");
  const goToRoute = (linkIndex) => {
    const route = links[linkIndex].getAttribute("route");
    if (window.$route.path === route.substring(1)) {
      return;
    }
    changeRoute(route);
  };
  for (let i = 0; i < links.length; i++) {
    links[i].addEventListener("click", () => {
      goToRoute(i);
    });
  }
};

window.onpopstate = function () {
  onRouteChange();
};

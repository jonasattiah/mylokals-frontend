const shopLang = "de";

window.$store = {
  auth: {
    token: getCookie("accessToken"),
    setAuth: (token) => {
      window.$store.auth.token = token;
      apiDefaults.headers.Authorization = `Bearer ${token}`;
    },
  },
  user: {
    user: null,
    orders: [],
  },
  category: {
    categories: [],
  },
  product: {
    variant: {
      id: null,
    },
  },
  basket: {
    id: getCookie("basketId"),
    basket: null,
  },
  checkout: {
    selectedPaymentMethod: null,
    selectedShippingOption: null,
  },
  payment: {
    initializationData: null,
    address: null,
  },
  order: {
    id: getCookie("orderSessionId"),
    order: null,
  },
};
apiDefaults.headers = {
  Authorization: `Bearer ${window.$store.auth.token}`,
};

const showFloatingBasket = () => {
  setCookie("showFloatingBasket", true);
  document.getElementById("floatingBasketBody").style.display = "block";
  document.getElementsByClassName("floating-inner")[0].classList.add("card");
  document
    .getElementsByClassName("floating-basket")[0]
    .classList.add("is-fixed");
  document.getElementById("body").classList.add("has-cart");
};

const hideFloatingBasket = (keepCookie) => {
  if (!keepCookie) removeCookie("showFloatingBasket");
  document.getElementById("floatingBasketBody").style.display = "none";
  document.getElementsByClassName("floating-inner")[0].classList.remove("card");
  document
    .getElementsByClassName("floating-basket")[0]
    .classList.remove("is-fixed");
  document.getElementById("body").classList.remove("has-cart");
};

if (getCookie("showFloatingBasket")) showFloatingBasket();

document.getElementById("floatingBasketClose").addEventListener("click", () => {
  hideFloatingBasket();
});

document.getElementById("navItemBasket").addEventListener("click", () => {
  showFloatingBasket();
});

const updateNavBasket = (basket) => {
  if (!basket.quantity_count) {
    document.getElementById("basketItemCount").style.display = "none";
  } else {
    document.getElementById("basketItemCount").style.display = "block";
  }
  document.getElementById("basketItemCount").innerHTML = basket.quantity_count;
  document.getElementById("floatingBasketTotal").innerHTML =
    basket._totalWithVat;
  renderBasketItems(basket.items, "floatingBasketItems");
};

const authApi = {
  auth: () => {
    return new Promise((resolve) => {
      api("sf/v1/user")
        .then((res) => {
          window.$store.user.user = res.data.user;
          resolve(res);
          document.getElementById("nav-user").innerHTML = res.data.user.email;
        })
        .catch((err) => {
          removeCookie("accessToken");
          window.$store.auth.token = null;
          window.$store.user.user = null;
        });
    });
  },
  login: (data) => {
    return new Promise((resolve, reject) => {
      api("sf/v1/user/login", {
        method: "POST",
        body: {
          user: {
            email: data.email,
            password: data.password,
          },
        },
      })
        .then((res) => {
          setCookie("accessToken", res.data.user.token);
          window.$store.auth.setAuth(res.data.user.token);
          resolve(res);
        })
        .catch((err) => reject(err));
    });
  },
};
const categoryApi = {
  fetchCategories: () => {
    const renderCategories = (categories, target) => {
      target.innerHTML = "";
      window.$store.category.categories = categories;
      categories
        .filter((c) => !c.parent)
        .forEach((item) => {
          const template = `<a route="/kategorie/${item.key}">${item.name}</a>`;
          let component = document.createElement("li");
          component.innerHTML = template;
          component.classList.add("item");
          target.appendChild(component);
          linkListener();
        });
    };
    return new Promise((resolve) => {
      api("sf/v1/categories").then((res) => {
        renderCategories(
          res.data.categories,
          document.getElementsByClassName("navCategories")[0]
        );
        renderCategories(
          res.data.categories,
          document.getElementsByClassName("navCategories")[1]
        );
        resolve(res);
      });
    });
  },
  fetchCategory: (categoryKey, query) => {
    return new Promise((resolve) => {
      api(`v1/shop/products/categories/${categoryKey}`, {
        query,
      }).then((res) => {
        resolve(res);
      });
    });
  },
};
const basketApi = {
  fetchBasket: () => {
    if (!window.$store.basket.id) return;
    return new Promise((resolve) => {
      api("v1/basket", {
        headers: {
          "basket-id": window.$store.basket.id,
        },
      }).then((res) => {
        window.$store.basket.basket = res.data;
        updateNavBasket(res.data);
        resolve(res.data);
        if (window.$route.key === "checkout") {
          if (!res.data.items.length) changeRoute("/basket");
        }
      });
    });
  },
  addItem: (variantId, quantity) => {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", apiUrl + "/v1/basket/item", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("basket-id", window.$store.basket.id);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && [200, 201].includes(xhr.status)) {
        const json = JSON.parse(xhr.responseText);
        setCookie("basketId", json.id);
        window.$store.basket.basket = json;
        window.$store.basket.id = json.id;
        updateNavBasket(json);
        showFloatingBasket();
      }
    };

    xhr.send(
      JSON.stringify({
        variantId,
        quantity: parseInt(quantity),
      })
    );
  },
  removeItem: (variantId) => {
    return new Promise((resolve) => {
      api(`v1/basket/item/${variantId}`, {
        method: "DELETE",
        headers: {
          "basket-id": window.$store.basket.id,
        },
      }).then((res) => {
        window.$store.basket.basket = res.data;
        updateNavBasket(res.data);
        resolve(res);
        if (window.$route.key === "checkout") {
          if (!res.data.items.length) changeRoute("/basket");
        }
        if (window.$route.key === "basket") {
          document.getElementById("toCheckoutButton").style.display = "none";
          document.getElementById("basketItems").innerHTML =
            "Dein Warenkorb ist leer";
        }
      });
    });
  },
};
const searchApi = {
  search: (term, options) => {
    return new Promise((resolve) => {
      api("sf/v1/search", {
        query: {
          term,
        },
      }).then((res) => {
        resolve(res);
      });
    });
  },
};

if (window.$store.auth.token) authApi.auth();

// Global call
categoryApi.fetchCategories();

function renderItems(targetId, items) {
  if (!items.length) {
    document.getElementById(targetId).innerHTML = "No Products available.";
    return;
  }
  items.forEach((item) => {
    const preview_image = item.images[0] ? item.images[0].url : null;
    const template = `
				    	<div class="prdct-itm" route="/produkt/${item.key}">
				    		<div class="prdct-itm_img">
				    			<img src="${preview_image}?height=330&width=310&size=1"/>
                  <a class="prdct-itm_cart-btn button btn-s">
                    <img src="https://cdn.purdia.com/assets/icons/default/basket-add.svg" style="height:16px;width:16px;">
                  </a>
				    		</div>
				    		<div style="max-height: 40px;overflow: hidden;">${item.name}</div>
				    		<div style="font-size: 15px;">${item._priceWithTax}</div>
				    	</div>
				      `;

    let component = document.createElement("div");
    component.innerHTML = template;
    component.classList.add("item");

    document.getElementById(targetId).appendChild(component);
    component
      .querySelector(".prdct-itm_cart-btn")
      .addEventListener("click", (e) => {
        e.stopPropagation();
        basketApi.addItem(item.available_variants[0].id, 1);
      });
    linkListener();
  });
}
function renderBasketItems(items, targetId) {
  document.getElementById(targetId).innerHTML = "";
  items.forEach((item) => {
    const template = `
                <div class="prdct-itm">
                  <div class="prdct-itm_img">
                    <img src="${item.image_url}?height=330&width=310&size=1"/>
                  </div>
                  <div class="prdct-itm-details">
                    <div style="max-height: 40px;overflow: hidden;">${
                      item.variant.name
                    }</div>
                    <div style="font-size: 15px;">${
                      item.quantity > 1 ? item.quantity + " x " : ""
                    } ${item.variant._priceWithTax}</div>
                    <div class="button btn-gray btn-xs basket-item-remove">${window.$t(
                      "component.basket.item.remove"
                    )}</div>
                  </div>
                </div>
                `;

    let component = document.createElement("div");
    component.innerHTML = template;
    component.classList.add("item");

    component
      .getElementsByClassName("button")[0]
      .addEventListener("click", () => {
        basketApi.removeItem(item.id).then(() => {
          component.remove();
        });
      });

    document.getElementById(targetId).appendChild(component);
  });
}
const renderLoginForm = (targetId, successCallback) => {
  const template = `
    <form id="form">
      <div class="headline">Login</div>
      <div class="form-field">
        <input class="form-field-input" name="email" id="email" placeholder="E-Mail" type="email" required>
      </div>
      <div class="form-field" style="margin-top: .5rem;">
        <input class="form-field-input" name="password" id="password" placeholder="Password" type="password" required>
      </div>
      <div class="error-message" id="errors"></div>
      <a class="button" id="submit" style="margin-top: .25rem;">Login</a>
    </form>
  `;
  let el = document.createElement("div");
  el.innerHTML = template;
  el.classList.add("login-form");

  el.querySelector("#submit").addEventListener("click", () => {
    const form = getFormData("form");
    authApi
      .login(form)
      .then((res) => {
        console.log(res);
        if (successCallback) successCallback();
      })
      .catch((err) => {
        if (err.data.errors) {
          el.querySelector("#errors").innerHTML = "Bitte prüfe deine Daten";
        }
      });
  });
  document.getElementById(targetId).appendChild(el);
};

window.$route = {};
const routes = [
  {
    path: "/",
    key: "index",
    view: "index",
  },
  {
    path: "/login",
    key: "login",
    view: "login",
  },
  {
    path: "/account",
    key: "account",
    view: "account",
  },
  {
    path: "/search",
    key: "search",
    view: "search",
  },
  {
    path: "/store",
    key: "store",
    view: "store",
  },
  {
    path: "/kategorie/:category",
    key: "category",
    view: "category",
  },
  {
    path: "/produkt/:product",
    key: "product",
    view: "product",
  },
  {
    path: "/basket",
    key: "basket",
    view: "basket",
  },
  {
    path: "/kasse",
    key: "checkout",
    view: "basket",
  },
  {
    path: "/order",
    key: "orderConfirmation",
    view: "orderConfirmation",
  },
];

onRouteChange();
linkListener();

let searchTerm = window.$route.query.s;
const elSearch = document.getElementById("search");
if (searchTerm) elSearch.value = searchTerm;
elSearch.addEventListener("change", (e) => {});

elSearch.addEventListener("keypress", (e) => {
  if (event.key === "Enter") {
    event.preventDefault();
    changeRoute(`/search?s=${e.target.value}`);
  }
});

document.getElementById("searchButton").addEventListener("click", (e) => {
  changeRoute(`/search?s=${e.target.value}`);
});

api("v1/shop")
  .then((res) => {
    const { name } = res.data;
    document.title = name;
    const configFeatures = {};

    res.data.features.forEach((feature, i) => {
      configFeatures[feature.key] = feature;
    });
  })
  .catch((err) => {
    if (err.status === 404) window.location = "https://purdia.com";
  });

const renderCookies = () => {
  const temp = `<div class="container mx-auto">Wir nutzen Cookies auf unserer Website. Einige von ihnen sind essenziell, während andere uns helfen, diese Website und Ihre Erfahrung zu verbessern. Mit der Nutzung unserer Website stimmen Sie der Verwendung von Cookies zu.</div>`;

  let el = document.createElement("div");
  el.innerHTML = temp;
  el.classList.add("cookies");

  return el;
};

if (!getCookie("cookies"))
  document
    .getElementById("app")
    .appendChild(renderCookies(), setCookie("cookies", true));

if (!["checkout", "basket"].includes(window.$route.key))
  basketApi.fetchBasket();

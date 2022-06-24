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

const authApi = {
  auth: () => {
    return new Promise((resolve) => {
      api("sf/v1/user")
        .then((res) => {
          window.$store.user.user = res.data.user;
          resolve(res);
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
          const template = `<a route="/category/${item.key}">${item.name}</a>`;
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
        window.$store.basket = res.data;
        document.getElementById("basketItemCount").innerHTML =
          res.data.quantity_count;
        resolve(res.data);
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
        document.getElementById("basketItemCount").innerHTML =
          json.quantity_count;
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
        window.$store.basket = res.data;
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
				    	<a class="prdct-itm" route="/product/${item.key}">
				    		<div class="prdct-itm_img">
				    			<img src="${preview_image}?height=330&width=310&size=1"/>
				    		</div>
				    		<div>${item.name}</div>
				    		<div>${item._priceWithTax}</div>
				    		<!--<div class="flex justify-center"><a class="prdct-itm_cart-btn button btn-s" href="https://twitter.com/jonasatia" target="_blank" rel="noopener">Add to cart</a></div>-->
				    	</a>
				      `;

    let component = document.createElement("div");
    component.innerHTML = template;
    component.classList.add("item");

    document.getElementById(targetId).appendChild(component);
    linkListener();
  });
}

const templates = [
  {
    name: "index",
    init: () => {
      categoryApi
        .fetchCategory("baby", {
          limit: 4,
        })
        .then((res) => {
          renderItems("items", res.data.products);
        });
    },
    template: `
				<div class="banner" style="display: flex;align-items: center;justify-content: center;"><div class="headline text-center" style="font-size: 64px;color: #e6e6e6;">Fast 1</div></div>
			    <div class="pt-48">
			    	<div>
			    		<div class="headline text-center">Titel</div>
			    	</div>
			    	<div class="prdcts mt-20 view-transition" id="items"></div>
			    </div>
				`,
  },
  {
    name: "login",
    init: () => {
      document.getElementById("submit").addEventListener("click", () => {
        const form = getFormData("form");
        authApi
          .login(form)
          .then((res) => {
            changeRoute("/account");
          })
          .catch((err) => {
            if (err.data.errors) {
              document.getElementById("errors").innerHTML =
                "Bitte prüfe deine Daten";
            }
          });
      });
    },
    template: `
				    <div>
				    	<form class="md:w-1/3 mx-auto" id="form">
				    		<div class="headline">Login</div>
				    		<div class="form-field">
					    		<input class="form-field-input" name="email" id="email" placeholder="E-Mail" type="email" required>
					    	</div>
					    	<div class="form-field" style="margin-top: .5rem;">
					    		<input class="form-field-input" name="password" id="password" placeholder="Password" type="password" required>
					    	</div>
                <div class="error-message" id="errors"></div>
					    	<a class="button" id="submit" style="margin-top: 1rem;">Login</a>
				    	</form>
				    </div>
				`,
  },
  {
    name: "account",
    init: () => {
      if (!window.$store.auth.token) {
        window.location = domain + "/login";
        return false;
      }
      api("v1/user/orders").then((res) => {
        window.$store.user.orders = res.data;
        function renderOrders(items) {
          items.forEach((item) => {
            const template = `
								    	<div>
								    		#${item.order_id}
								    	</div>
								      `;

            let component = document.createElement("div");
            component.innerHTML = template;
            component.classList.add("item");

            document.getElementById("items").appendChild(component);
          });
        }
        renderOrders(res.data);
      });
    },
    template: `
				    <div>
				    	<div class="md:w-1/2">
				    		<div class="headline">Account</div>
				    		<div class="card">
				    			<div class="mt-4" style="font-weight: 600;margin-bottom: 0.5rem">Orders</div>
				    			<div id="items"></div>
				    		</div>
				    	</div>
				    </div>
				`,
  },
  {
    name: "category",
    init: () => {
      return new Promise((resolve) => {
        function renderItems(items) {
          if (!items.length) {
            document.getElementById("items").innerHTML =
              "No Products available.";
            document.getElementById("items-skeleton").style.display = "none";
            return;
          }
          document.getElementById("items-skeleton").style.display = "none";
          items.forEach((item) => {
            const preview_image = item.images[0] ? item.images[0].url : null;
            const template = `
						    	<a class="prdct-itm" route="/product/${item.key}">
						    		<div class="prdct-itm_img">
						    			<img src="${preview_image}?height=330&width=310&size=1"/>
						    		</div>
						    		<div>${item.name}</div>
						    		<div>${item._priceWithTax}</div>
						    		<!--<div class="flex justify-center"><a class="prdct-itm_cart-btn button btn-s" href="https://twitter.com/jonasatia" target="_blank" rel="noopener">Add to cart</a></div>-->
						    	</a>
						      `;

            let component = document.createElement("div");
            component.innerHTML = template;
            component.classList.add("item");

            document.getElementById("items").appendChild(component);
          });
        }
        const renderSidebarItems = (items) => {
          items.forEach((item) => {
            const template = `<a class="" route="/category/${item.key}">${item.name}</a>`;
            let component = document.createElement("li");
            component.innerHTML = template;
            component.classList.add("item");

            document.getElementById("categoriesSidebar").appendChild(component);
          });
        };
        api(`v1/shop/products/categories/${window.$route.params.product}`).then(
          (res) => {
            renderItems(res.data.products);
            resolve();
          }
        );
        if (!window.$store.category.categories.length) {
          categoryApi.fetchCategories().then((res) => {
            renderSidebarItems(res.data.categories);
          });
        } else {
          renderSidebarItems(window.$store.category.categories);
        }
      });
    },
    template: `
			    <div class="pt-48 flex">
			    	<div class="hidden md:block w-1/4">
			    		<div class="categories-sidebar">
				    		<div class="headline">Products</div>
				    		<ul id="categoriesSidebar"></ul>
				    	</div>
			    	</div>
			    	<div class="w-full md:w-3/4">
				    	<div>
				    		<div class="headline">Products</div>
				    	</div>
				    	<div class="skeleton" id="items-skeleton"></div>
				    	<div class="prdcts mt-20 view-transition" id="items">
				    	</div>
			    	</div>
			    </div>
				`,
  },
  {
    name: "product",
    init: () => {
      return new Promise((resolve) => {
        const renderGallery = (images, target) => {
          const previewImage = images[0] ? images[0].url : null;
          let el = document.createElement("div");
          el.innerHTML = `
          		<div class="gallery">
    				<div class="gallery-preview"></div>
		    		<div class="prdct-img">
		    			<img class="gallery-image"/>
		    		</div>
	    		</div>
          		`;
          const setImage = (imageUrl) => {
            el.getElementsByClassName("gallery-image")[0].setAttribute(
              "src",
              `${imageUrl}?height=330&width=310&size=1`
            );
          };
          setImage(previewImage);
          let previewImages = [];
          images.forEach((image, index) => {
            let galleryImage = document.createElement("div");
            galleryImage.classList.add("gallery-preview-img");
            if (index === 0) galleryImage.classList.add("active");
            galleryImage.innerHTML = `
              		<img class="product-image-background" src="${image.url}?height=330&width=310&size=1"/>
              	`;
            galleryImage.addEventListener("click", (e) => {
              previewImages = document.getElementsByClassName(
                "gallery-preview-img"
              );
              for (var i = previewImages.length - 1; i >= 0; i--) {
                previewImages[i].classList.remove("active");
              }
              setImage(image.url);
              galleryImage.classList.add("active");
            });
            el.getElementsByClassName("gallery-preview")[0].appendChild(
              galleryImage
            );
            target.appendChild(el);
          });
        };
        function renderItem(product) {
          const template =
            `
						    	<div class="md:flex">
						    		<div class="md:w-1/2">
						    			<div class="product-image"></div>
							    	</div>
							    	<div class="md:w-1/2 prdct-col-right">
							    		<div class="headline">${product.name}</div>
							    		<div>${product._priceWithTax}</div>
							    		<a class="prdct-cart-btn button" id="addItem">${window.$t(
                        "view.product.addToCart"
                      )}</a>
						    		</div>
						    	</div>
                  ` +
            (product.description[0]
              ? `
                  <div class="product-details">
                    <div class="headline">Beschreibung</div>
                    <div>${product.description[0].content}</div>
                  </div>
						      `
              : "");

          let el = document.createElement("div");
          el.innerHTML = template;
          el.classList.add("prdct");
          renderGallery(
            product.images,
            el.getElementsByClassName("product-image")[0]
          );

          document.getElementById("product").appendChild(el);

          document.getElementById("addItem").addEventListener("click", () => {
            basketApi.addItem(product.available_variants[0].id, 1);
          });
        }

        fetch(`${apiUrl}v1/shop/products/${window.$route.params.product}`)
          .then((response) => response.json())
          .then((data) => {
            window.$store.product.variant.id = data.available_variants[0].id;
            document.getElementById("product-skeleton").style.display = "none";
            renderItem(data);
            resolve();
          });
      });
    },
    template: `
				<div class="prdct-view view-transition">
					<div class="skeleton" id="product-skeleton"></div>
					<div id="product"></div>
				</div>
				`,
  },
  {
    name: "basket",
    init: () => {
      const fetchBasket = () => {
        basketApi.fetchBasket().then((basket) => {
          renderItems(basket.items);
          if (!basket.items.length) {
            document.getElementById("toCheckoutButton").style.display = "none";
          }
        });
      };

      function renderItems(items) {
        document.getElementById("items").innerHTML = "";
        items.forEach((item) => {
          const template = `
					    	<a class="prdct-itm">
					    		<div class="prdct-itm_img">
					    			<img src="${item.image_url}?height=330&width=310&size=1"/>
					    		</div>
					    		<div class="prdct-itm-details">
					    			<div>${item.variant.name}</div>
					    			<div>${item.quantity > 1 ? item.quantity + " x " : ""} ${
            item.variant._priceWithTax
          }</div>
					    			${
                      window.$route.config.key === "basket"
                        ? `<div class="button btn-gray btn-xs basket-item-remove">${window.$t(
                            "component.basket.item.remove"
                          )}</div>`
                        : ""
                    }
					    		</div>
					    	</a>
					      `;

          let component = document.createElement("div");
          component.innerHTML = template;
          component.classList.add("item");
          if (window.$route.config.key === "basket") {
            component
              .getElementsByClassName("button")[0]
              .addEventListener("click", () => {
                basketApi.removeItem(item.id).then(() => {
                  component.remove();
                });
              });
          }
          document.getElementById("items").appendChild(component);
        });
      }
      if (window.$store.basket.items) {
        renderItems(window.$store.basket.items);
        fetchBasket();
      } else {
        fetchBasket();
      }

      if (window.$route.config.key === "checkout") {
        document.getElementById("checkoutView").innerHTML =
          checkoutView.template;
        checkoutView.init();
        document.getElementById("toCheckoutButton").style.display = "none";
        document.getElementById("checkoutContainer").style.display = "block";
      } else {
        document.getElementById("checkoutContainer").style.display = "none";
      }
    },
    template: `
				    <div class="basket-checkout-view pt-48">
				    	<div>
				    		<div class="headline">${window.$t("view.basket.title")}</div>
				    	</div>
				    	<div class="flex sm:column-reverse">
				    		<div class="md:w-1/2" id="checkoutContainer">
					    		<div id="checkoutView"></div>
					    	</div>
					    	<div class="md:w-1/2">
					    		<div class="prdcts bskt-items mt-20" id="items" style="margin-bottom: 1rem;"></div>
					    		<a class="button w-full" route="/checkout" id="toCheckoutButton">${window.$t(
                    "view.basket.button"
                  )}</a>
					    	</div>
				    	</div>
				    </div>
				`,
  },
  ...[checkoutView],
  {
    name: "orderConfirmation",
    init: () => {},
    template: `
				    <div class="pt-48 text-center">
				    	<div>
				    		<div class="headline">Danke für deine Bestellung.</div>
				    	</div>
				    	<a class="button" href="/">Zum Shop</a>
				    </div>
				`,
  },
];
// Routing
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
    path: "/category/:category",
    key: "category",
    view: "category",
  },
  {
    path: "/product/:product",
    key: "product",
    view: "product",
  },
  {
    path: "/basket",
    key: "basket",
    view: "basket",
  },
  {
    path: "/checkout",
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

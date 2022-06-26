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
  document.getElementById("body").classList.add("has-cart");
};

if (getCookie("showFloatingBasket")) showFloatingBasket();

document.getElementById("floatingBasketClose").addEventListener("click", () => {
  removeCookie("showFloatingBasket");
  document.getElementById("floatingBasketBody").style.display = "none";
  document.getElementsByClassName("floating-inner")[0].classList.remove("card");
  document.getElementById("body").classList.remove("has-cart");
});

document.getElementById("navItemBasket").addEventListener("click", () => {
  showFloatingBasket();
});

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
          [
            {
              name: "Drogerie",
            },
            {
              name: "Lebensmittel",
            },
            {
              name: "Kleidung",
            },
          ],
          document.getElementsByClassName("navCategories")[0]
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
        document.getElementById("floatingBasketTotal").innerHTML =
          res.data._total;
        renderBasketItems(res.data.items, "floatingBasketItems");
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
        renderBasketItems(json.items, "floatingBasketItems");
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
        window.$store.basket = res.data;
        renderBasketItems(res.data.items, "floatingBasketItems");
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
                  <a class="prdct-itm_cart-btn button btn-s" href="https://twitter.com/jonasatia" target="_blank" rel="noopener">+</a>
				    		</div>
				    		<div>${item.name}</div>
				    		<div>${item._priceWithTax}</div>
				    	</a>
				      `;

    let component = document.createElement("div");
    component.innerHTML = template;
    component.classList.add("item");

    document.getElementById(targetId).appendChild(component);
    linkListener();
  });
}
function renderStores(targetId, items) {
  if (!items.length) {
    document.getElementById(targetId).innerHTML = "No Products available.";
    return;
  }
  items.forEach((item) => {
    const template = `
              <div class="flex" style="height: 0px; padding-bottom: 64%; position: relative;" route="/store">
                <div class="mb-1 flex-none relative flex items-center justify-center" style="border-radius: 4px; height: 100%; width: 100%; box-shadow: rgb(136, 136, 136) 0px 0px 1px inset; position: absolute; top: 0px; left: 0px; overflow: hidden;">
                  <div class="store-card-banner" style="background: url('${item.bannerUrl}?height=216&size=2') center center / cover rgb(255, 255, 255); border-radius: 4px; height: 100%; width: 100%; box-shadow: rgb(136, 136, 136) 0px 0px 1px inset;"></div>
                </div>
              </div>
              `;

    let component = document.createElement("div");
    component.innerHTML = template;
    component.classList.add("store-list-item");

    document.getElementById(targetId).appendChild(component);
    linkListener();
  });
}
function renderBasketItems(items, targetId) {
  document.getElementById(targetId).innerHTML = "";
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
                    <div class="button btn-gray btn-xs basket-item-remove">${window.$t(
                      "component.basket.item.remove"
                    )}</div>
                  </div>
                </a>
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

const templates = [
  {
    name: "index",
    init: () => {
      categoryApi
        .fetchCategory("baby", {
          limit: 10,
        })
        .then((res) => {
          renderItems("items", res.data.products);
        });

      const addMarkers = (markers) => {
        markers.reverse().forEach((marker) => {
          if (!document.getElementById("map_marker_" + marker.id)) {
            if (
              marker.coordinates &&
              typeof marker.coordinates[0] === "number" &&
              typeof marker.coordinates[1] === "number"
            ) {
              const el_wrapper = document.createElement("div");
              el_wrapper.className = "marker-wrapper";
              el_wrapper.setAttribute("id", "map_marker_" + marker.id);

              const el_marker = document.createElement("div");
              el_marker.className = [
                "marker",
                !marker.approved && markers.length > 30
                  ? "marker--secondary"
                  : "",
                `marker--${marker.type}`,
              ].join(" ");

              const el_icon = document.createElement("div");
              el_icon.className = "marker-icon";
              el_marker.appendChild(el_icon);

              el_wrapper.appendChild(el_marker);

              const store_banner = document.createElement("img");
              store_banner.className = "marker-store-preview-banner";
              store_banner.src = marker.preview_image_url;

              const store_name = document.createElement("div");
              store_name.className = "headline headline--xs";
              store_name.src = marker.preview_image_url;
              const store_name_text = document.createTextNode(marker.name);
              store_name.appendChild(store_name_text);

              const store_preview = document.createElement("div");
              store_preview.className = "marker-store-preview";
              store_preview.appendChild(store_banner);
              store_preview.appendChild(store_name);
              store_preview.addEventListener("click", () => {
                //vm.$router.push({name:'store',params:{store_id:marker.key},query:{...vm.$route.query,map:null}})
              });

              el_wrapper.appendChild(store_preview);

              function clickMarker(event) {
                // document.getElementById('map_marker_' + marker.id).classList.add("is-active")
                // vm.$emit('update', {
                //   id: marker.id,
                //   type: marker.type,
                //   coordinates: marker.coordinates
                // })
              }

              el_wrapper.addEventListener("click", clickMarker);

              const new_marker = new mapboxgl.Marker(el_wrapper)
                .setLngLat(marker.coordinates)
                .addTo(window.map);
              //vm.markers_on_map.push(new_marker)
            }
          }
        });
      };

      mapboxgl.accessToken =
        "pk.eyJ1Ijoiam9lbmFzam8iLCJhIjoiY2o2M3k2NW96MWdpcTJybndtbmQ2aWtpYyJ9.9f0O8JplL4G6An4-ci8dQw";
      const map = new mapboxgl.Map({
        container: "map", // container ID
        style: "mapbox://styles/joenasjo/cjyfyl58q00rh1cs2gvz12lfn", // style URL
        center: [6.551865, 51.188353], // starting position [lng, lat]
        zoom: 11, // starting zoom
      });
      window.map = map;

      // api("mylokals/v1/stores?location=41352").then((res) => {

      // });

      const stores = [
        {
          bannerUrl:
            "http://localhost:3001/api/v1/images/61333f5373221b71f7fac992/2021-09-04/6ac057f8070ea81d3f417018e6c450672de885fb60c5bc8e.jpeg",
        },
        {
          bannerUrl:
            "https://api.mylokals.de/api/v1/images/614209a5fa66d79da38ad6e8/2021-09-24/eb46697dda24e67b131c2f1234c4bd9dd6c6f291af2d4f17.jpeg",
        },
        {
          bannerUrl:
            "https://api.mylokals.de/api/v1/images/61420a26fa66d79da38ad6eb/2021-09-15/8da745f45e31c1b0efddbb6a5969551fd62bb2aef4776ad9.jpeg",
        },
      ];

      renderStores("stores", stores);
      addMarkers([
        {
          id: 1,
          coordinates: [6.576801, 51.165982],
        },
        {
          id: 2,
          coordinates: [6.578233, 51.165589],
        },
        {
          id: 3,
          coordinates: [6.513069, 51.190269],
        },
      ]);
    },
    template: `
      <div class="container md:flex items-center">
          <div class="md:w-1/2">
            <div class="headline text-center" style="text-align: left;font-size: 48px;line-height: 47px;margin-bottom: 0.5rem;">
              Wir liefern<br>
              zu dir nach Hause
            </div>
            <div style="font-size: 24px;margin-bottom: 4rem;">Der Klimafreundliche lokale Lieferdienst</div>
            <div class="button btn-l" route="/search">Produkte Suchen</div>
          </div>
          <div class="md:w-1/2">
    				<div class="banner" style="display: flex;align-items: center;justify-content: center;">
              <div class="" id='map' style='width: 100%; height: 100%;border-radius: 6px;'></div>
            </div>
          </div>
        </div>
      </div>
			    <div style="margin-top: 4rem;">

            <div style="background: #FFE26A;padding: 2rem 0;">
              <div class="container">
    			    	<div>
    			    		<div class="headline">Aus deiner Stadt</div>
    			    	</div>
                <div class="store-list" id="stores"></div>
                <div class="button btn-s" style="margin-top: 2rem;">Mehr Geschäfte</div>
              </div>
            </div>

            <div class="container" style="margin-top: 4rem;padding: 2rem 0;">
              <div class="headline text-center" style="font-size: 48px;line-height: 47px;margin-bottom:3rem;">
                Das liefern wir                
              </div>
              <div style="grid-template-columns: repeat(6, minmax(0, 1fr));gap: 0.75rem;display: grid;">
                <div>
                  <div style="background: radial-gradient(#fff, #f5f5f5);border-radius: 6px;">
                    <img src="http://localhost:3001/api/v1/images/5fe7907a77d26a45c1a51c51/62b07d12e7879a56b280f26e/1dacd5cae457c7a88fa319378f1dea8a85d42e00e3ae8b50.png?height=330&width=310&size=1" style="width: 100%;border-radius: 6px;">
                  </div>
                  <div class="text-center">Lebensmittel</div>
                </div>
                <div>
                  <div style="background: radial-gradient(#fff, #f5f5f5);border-radius: 6px;">
                    <img src="http://localhost:3001/api/v1/images/5fe7907a77d26a45c1a51c51/62b07d12e7879a56b280f26e/1dacd5cae457c7a88fa319378f1dea8a85d42e00e3ae8b50.png?height=330&width=310&size=1" style="width: 100%;border-radius: 6px;">
                  </div>
                  <div class="text-center">Drogerieartikel</div>
                </div>
                <div>
                  <div style="background: radial-gradient(#fff, #f5f5f5);border-radius: 6px;">
                    <img src="http://localhost:3001/api/v1/images/5fe7907a77d26a45c1a51c51/62b07d12e7879a56b280f26e/1dacd5cae457c7a88fa319378f1dea8a85d42e00e3ae8b50.png?height=330&width=310&size=1" style="width: 100%;border-radius: 6px;">
                  </div>
                  <div class="text-center">Bücher</div>
                </div>
                <div>
                  <div style="background: radial-gradient(#fff, #f5f5f5);border-radius: 6px;">
                    <img src="http://localhost:3001/api/v1/images/5fe7907a77d26a45c1a51c51/62b07d12e7879a56b280f26e/1dacd5cae457c7a88fa319378f1dea8a85d42e00e3ae8b50.png?height=330&width=310&size=1" style="width: 100%;border-radius: 6px;">
                  </div>
                  <div class="text-center">Fashion</div>
                </div>
                <div>
                  <div style="background: radial-gradient(#fff, #f5f5f5);border-radius: 6px;">
                    <img src="http://localhost:3001/api/v1/images/5fe7907a77d26a45c1a51c51/62b07d12e7879a56b280f26e/1dacd5cae457c7a88fa319378f1dea8a85d42e00e3ae8b50.png?height=330&width=310&size=1" style="width: 100%;border-radius: 6px;">
                  </div>
                  <div class="text-center">Medikamente</div>
                </div>
                <div>
                  <div style="background: radial-gradient(#fff, #f5f5f5);border-radius: 6px;">
                    <img src="http://localhost:3001/api/v1/images/5fe7907a77d26a45c1a51c51/62b07d12e7879a56b280f26e/1dacd5cae457c7a88fa319378f1dea8a85d42e00e3ae8b50.png?height=330&width=310&size=1" style="width: 100%;border-radius: 6px;">
                  </div>
                  <div class="text-center">Und vieles mehr</div>
                </div>
              </div>
            </div>

            <div style="margin-top: 8rem;padding: 8rem 0;">
              <div class="headline text-center" style="font-size: 48px;line-height: 47px;margin-bottom:3rem;">
                Wie funktioniert MyLokals?
              </div>
            </div>
            
            <div class="container">
              <div style="margin-top: 8rem;">
                <div class="headline">Produkte</div>
              </div>
  			    	<div class="prdcts mt-20 view-transition" id="items"></div>
            </div>
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
    name: "search",
    init: () => {
      categoryApi
        .fetchCategory("baby", {
          limit: 100,
        })
        .then((res) => {
          renderItems("items", res.data.products);
        });
    },
    template: `
    <div class="container">
      <div>Ergebnisse (4256)</div>
      <div class="prdcts mt-20 view-transition" id="items" style="margin-top:1rem;"></div>
    </div>
    `,
  },
  {
    name: "store",
    init: () => {
      categoryApi
        .fetchCategory("baby", {
          limit: 10,
        })
        .then((res) => {
          renderItems("items", res.data.products);
        });

      const renderSidebarItems = (items) => {
        items.forEach((item) => {
          const template = `<a class="" route="/category/${item.key}">${item.name}</a>`;
          let component = document.createElement("li");
          component.innerHTML = template;
          component.classList.add("item");

          document.getElementById("categoriesSidebar").appendChild(component);
        });
      };

      categoryApi.fetchCategories().then((res) => {
        renderSidebarItems(res.data.categories);
      });
    },
    template: `
            <div class="container">
              <div class="flex">
                <div class="store-list-item" style="width:100%;max-width: 500px;">
                  <div class="flex" style="height: 0px; padding-bottom: 64%; position: relative;" route="/store">
                    <div class="mb-1 flex-none relative flex items-center justify-center" style="border-radius: 4px; height: 100%; width: 100%; box-shadow: rgb(136, 136, 136) 0px 0px 1px inset; position: absolute; top: 0px; left: 0px; overflow: hidden;">
                      <div class="store-card-banner" style="background: url('http://localhost:3001/api/v1/images/61333f5373221b71f7fac992/2021-09-04/6ac057f8070ea81d3f417018e6c450672de885fb60c5bc8e.jpeg?height=216&size=2') center center / cover rgb(255, 255, 255); border-radius: 4px; height: 100%; width: 100%; box-shadow: rgb(136, 136, 136) 0px 0px 1px inset;"></div>
                    </div>
                  </div>
                </div>
                <div style="margin-left: 1rem;">
                  <div class="headline" style="margin-bottom: .5rem;">Buch und Spiel kiste</div>
                  <div>Bücher, Spielzeug</div>
                </div>
              </div>

              <div class="md:flex" style="margin-top: 4rem;">
                <ul id="categoriesSidebar" style="max-width: 200px;width: 100%;padding-right: 1rem;"></ul>
                <div>
                  <div class="w-2/3 md:w-1/2" style="margin-bottom: 1rem;">
                    <div class="form-field form-field-search">
                      <input class="form-field-input" name="search" id="search" placeholder="Suche">
                      <img class="search-icon" src="https://cdn.purdia.com/mylokals/icons/search.svg">
                    </div>
                  </div>
                  <div class="prdcts mt-20 view-transition" id="items"></div>
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
			    <div class="pt-48 flex mx-auto container" style="max-width: 1366px;">
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
				    	<div class="prdcts mt-20 view-transition category-product-list" id="items">
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
        <div class="container">
  				<div class="prdct-view view-transition">
  					<div class="skeleton" id="product-skeleton"></div>
  					<div id="product"></div>
  				</div>
        </div>
				`,
  },
  {
    name: "basket",
    init: () => {
      const fetchBasket = () => {
        basketApi.fetchBasket().then((basket) => {
          renderBasketItems(basket.items, "items");
          if (!basket.items.length) {
            document.getElementById("toCheckoutButton").style.display = "none";
          }
        });
      };

      if (window.$store.basket.items) {
        renderBasketItems(window.$store.basket.items, "items");
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
				    <div class="basket-checkout-view pt-48 container">
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

let searchTerm = window.$route.query.s;
const elSearch = document.getElementById("search");
if (searchTerm) elSearch.value = searchTerm;
elSearch.addEventListener("change", (e) => {
  console.log(e.target.value);
});

elSearch.addEventListener("keypress", (e) => {
  if (event.key === "Enter") {
    event.preventDefault();
    changeRoute(`/search?s=${e.target.value}`);
  }
});

document.getElementById("searchButton").addEventListener("click", (e) => {
  changeRoute(`/search?s=${e.target.value}`);
})

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

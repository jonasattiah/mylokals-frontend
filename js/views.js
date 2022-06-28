const templates = [
  {
    name: "index",
    init: () => {},
    template: `-`,
  },
  {
    name: "login",
    init: () => {
      renderLoginForm("login-form", () => {
        changeRoute("/account");
      });
    },
    template: `
				    <div class="md:w-1/3 mx-auto" id="login-form"></div>
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
      categoryApi;
      searchApi.search(window.$route.query.s).then((res) => {
        renderItems("items", res.data.results);
      });
    },
    template: `
    <div class="container">
      <div class="flex">
        <div class="hidden md:block" style="padding-right: 1rem;width: 25%;">
          <div>Filter</div>
          <div style="font-size: 14px;">
            <div>Ort: Grevenbroich <a>Ändern</a></div>
            <label>
              <input class="form-field-input" type="checkbox" name="freeDelivery">
              <span>Kostenlose Lieferung</span>
            </label>
          </div>
        </div>
        <div>
          <div>Ergebnisse (4256)</div>
          <div class="prdcts mt-20 view-transition" id="items" style="margin-top:1rem;"></div>
        </div>
      </div>
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
                <ul class="hidden md:block" id="categoriesSidebar" style="max-width: 200px;width: 100%;padding-right: 1rem;"></ul>
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
            document.getElementById("category-title").innerHTML =
              res.data.title;
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
				    		<div>Alle Kategorien</div>
				    		<ul id="categoriesSidebar"></ul>
				    	</div>
			    	</div>
			    	<div class="w-full md:w-3/4">
				    	<div>
				    		<div class="headline" id="category-title"></div>
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

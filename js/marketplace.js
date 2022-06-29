templates[0] = {
  name: "index",
  init: () => {
    const availableCities = [
      {
        name: "Grevenbroich",
        key: "grevenbroich",
        coordinates: [6.583, 51.09],
      },
      {
        name: "Korschenbroich",
        key: "korschenbroich",
        coordinates: [6.5535597, 51.1854975],
      },
      {
        name: "Neuss",
        key: "neuss",
        coordinates: [6.6715195, 51.1761706],
      },
      {
        name: "In ganz Deutschland suchen",
        key: "DE",
      },
    ];
    let currentCity = getCookie("cuCity")
      ? availableCities.find((city) => city.key === getCookie("cuCity"))
      : availableCities[0];

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
      container: "map",
      style: "mapbox://styles/joenasjo/cjyfyl58q00rh1cs2gvz12lfn",
      center: currentCity.coordinates,
      zoom: 12,
    });
    window.map = map;

    function renderStores(targetId, items) {
      if (!items.length) {
        document.getElementById(targetId).innerHTML = "No Products available.";
        return;
      }
      items.forEach((item) => {
        const template = `
                  <div class="flex" style="height: 0px; padding-bottom: 64%; position: relative;" route="/store">
                    <div class="mb-1 flex-none relative flex items-center justify-center" style="border-radius: 6px; height: 100%; width: 100%; box-shadow: rgb(136, 136, 136) 0px 0px 1px inset; position: absolute; top: 0px; left: 0px; overflow: hidden;">
                      <div class="store-card-banner" style="background: url('${item.bannerUrl}?height=216&size=2') center center / cover rgb(255, 255, 255); border-radius: 6px; height: 100%; width: 100%; box-shadow: rgb(136, 136, 136) 0px 0px 1px inset;"></div>
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

    // api("mylokals/v1/stores?location=41352").then((res) => {

    // });

    const stores = [
      {
        bannerUrl:
          "https://api.mylokals.de/api/v1/images/61420a26fa66d79da38ad6eb/2021-09-15/8da745f45e31c1b0efddbb6a5969551fd62bb2aef4776ad9.jpeg",
      },
      {
        bannerUrl:
          "https://api.mylokals.de/api/v1/images/61333f5373221b71f7fac992/2021-09-15/12401cdae14f40bc21daab934c446fe32fc6dc66a5f42326.jpeg",
      },
      {
        bannerUrl:
          "https://api.mylokals.de/api/v1/images/614209a5fa66d79da38ad6e8/2021-09-24/eb46697dda24e67b131c2f1234c4bd9dd6c6f291af2d4f17.jpeg",
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

    function renderCityList(items) {
      items.forEach((item) => {
        const template = `
              <input name="city" value="${item.key}" type="radio">
              ${item.name}
              `;

        let el = document.createElement("label");
        el.className = "list-item";
        el.innerHTML = template;
        if (item.selected) {
          el.querySelector("input").checked = true;
          window.$store.checkout.selectedPaymentMethod = item.key;
          el.classList.add("active");
        }
        el.addEventListener("change", (e) => {
          setCookie("cuCity", e.target.value);
          changeRoute("/");
        });

        document.getElementById("cities").appendChild(el);
      });
    }
    if (!getCookie("cuCity")) {
      document.getElementById("citySearch").style.display = "block";
      renderCityList(availableCities);
    }
  },
  template: `
      <div class="container md:flex items-center" style="padding-top: 1rem;">
          <div class="md:w-1/2">
            <div class="headline text-center" style="text-align: left;font-size: 48px;line-height: 47px;margin-bottom: 0.5rem;">
              Wir liefern<br>
              zu dir nach Hause
            </div>
            <div style="font-size: 24px;margin-bottom: 4rem;">Der Klimafreundliche lokale Lieferdienst</div>
            <div class="button btn-l" route="/search">Produkte Suchen</div>
          </div>
          <div class="md:w-1/2 hidden md:block">
    				<div class="banner" style="display: flex;align-items: center;justify-content: center;">
              <div class="" id='map' style='width: 100%; height: 100%;border-radius: 6px;'></div>
            </div>
          </div>
        </div>
      </div>
			    <div style="margin-top: 4rem;">

            <div class="container" style="margin-top: 4rem;padding: 2rem 1rem;">
              <div class="headline text-center" style="font-size: 48px;line-height: 47px;margin-bottom:3rem;">
                Das liefern wir                
              </div>
              <div class="home-categories-grid">
                <div>
                  <div style="background: radial-gradient(#fff, #f5f5f5);border-radius: 6px;">
                    <img src="https://integration.api.perdia.de/api/v1/images/5fe7907a77d26a45c1a51c51/62ba076a37565f5f748954a6/a2bd55dd24ee251b2d3706d270b9a59305cad35f77d15b39.png?height=310&width=310&size=1" style="width: 100%;border-radius: 6px;">
                  </div>
                  <div class="text-center" style="margin-top: 1rem;">Lebensmittel</div>
                </div>
                <div>
                  <div style="background: radial-gradient(#fff, #f5f5f5);border-radius: 6px;">
                    <img src="https://integration.api.perdia.de/api/v1/images/5fe7907a77d26a45c1a51c51/62ba09f837565f5f748954b4/b6eb525b6ae13253bfac5e725f7eba40410ed07b6d9d857d.png?height=310&width=310&size=1" style="width: 100%;border-radius: 6px;">
                  </div>
                  <div class="text-center" style="margin-top: 1rem;">Drogerie</div>
                </div>
                <div>
                  <div style="background: radial-gradient(#fff, #f5f5f5);border-radius: 6px;">
                    <img src="https://integration.api.perdia.de/api/v1/images/5fe7907a77d26a45c1a51c51/62ba0a5e37565f5f748954b9/a5409083aaf495dabca59c4de6396613232cb8ab3b4fc7f4.png?height=310&width=310&size=1" style="width: 100%;border-radius: 6px;">
                  </div>
                  <div class="text-center" style="margin-top: 1rem;">Haushalt</div>
                </div>
                <div>
                  <div style="background: radial-gradient(#fff, #f5f5f5);border-radius: 6px;">
                    <img src="https://integration.api.perdia.de/api/v1/images/5fe7907a77d26a45c1a51c51/62ba2eaa37565f5f748954e8/7df1282a9643b5ef4950d49fd0f99a8594af5baef3f6ee0c.png?height=310&width=310&size=1" style="width: 100%;border-radius: 6px;">
                  </div>
                  <div class="text-center" style="margin-top: 1rem;">Wohnen</div>
                </div>
                <div>
                  <div style="background: radial-gradient(#fff, #f5f5f5);border-radius: 6px;">
                    <img src="https://integration.api.perdia.de/api/v1/images/5fe7907a77d26a45c1a51c51/62ba303537565f5f748954ee/5a54902ba6c8d48cfc8a7d0dc7f74e37979960262b1401c7.png?height=310&width=310&size=1" style="width: 100%;border-radius: 6px;">
                  </div>
                  <div class="text-center" style="margin-top: 1rem;">Elektronik</div>
                </div>
                <div>
                  <div style="background: radial-gradient(#fff, #f5f5f5);border-radius: 6px;">
                    <img src="https://integration.api.perdia.de/api/v1/images/5fe7907a77d26a45c1a51c51/62ba310a37565f5f748954f2/96d7330e5351b343a48f4710525aa0cf45a9398be5a67ff5.png?height=310&width=310&size=1" style="width: 100%;border-radius: 6px;">
                  </div>
                  <div class="text-center" style="margin-top: 1rem;">Und vieles mehr</div>
                </div>
              </div>
              <div class="text-center" style="margin-top: 4rem;">
                <a>Alle Kategorien anzeigen</a>
              </div>
            </div>

            <div class="hidden md:block" style="margin-top: 16rem;">
              <div class="container">
                <div style="background: #FFE26A;padding: 2rem;border-radius:6px;">
                  <div>
                    <div class="headline">Aus deiner Stadt</div>
                  </div>
                  <div class="store-list" id="stores"></div>
                </div>
              </div>
            </div>

            <div style="margin-top: 8rem;padding: 8rem 0;">
              <div class="container md:flex items-center">
                <div class="md:w-1/2">
                  <img class="w-full" src="https://cdn.purdia.com/mylokals/giftcard-hand.svg">
                </div>
                <div class="md:w-1/2">
                  <div class="headline" style="font-size: 50px;line-height: 50px;margin-bottom:3rem;">
                    Lokal kaufen<br>Gutschein gewinnen.
                  </div>
                </div>
              </div>
            </div>
			    </div>
          <div class="modal hidden" id="citySearch">
            <div class="modal-body">
                <div class="headline">Suche deine Stadt</div>
                <div class="form-field form-field-search">
                  <input
                    class="form-field-input"
                    name="city-search"
                    id="city-search"
                    placeholder="Stadt order PLZ"
                  />
                  <img
                    id="searchButton"
                    class="search-icon"
                    src="https://cdn.purdia.com/mylokals/icons/search.svg"
                  />
                </div>
                <ul class="list" style="margin-top: 1rem;" id="cities"></ul>
            </div>
          </div>
				`,
};

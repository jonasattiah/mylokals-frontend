templates[0] = {
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
          <div class="md:w-1/2 hidden md:block">
    				<div class="banner" style="display: flex;align-items: center;justify-content: center;">
              <div class="" id='map' style='width: 100%; height: 100%;border-radius: 6px;'></div>
            </div>
          </div>
        </div>
      </div>
			    <div style="margin-top: 4rem;">

            <div class="hidden md:block" style="background: #FFE26A;padding: 2rem 0;">
              <div class="container">
    			    	<div>
    			    		<div class="headline">Aus deiner Stadt</div>
    			    	</div>
                <div class="store-list" id="stores"></div>
                <div class="button btn-s" style="margin-top: 2rem;">Mehr Geschäfte</div>
              </div>
            </div>

            <div class="container" style="margin-top: 4rem;padding: 2rem 1rem;">
              <div class="headline text-center" style="font-size: 48px;line-height: 47px;margin-bottom:3rem;">
                Das liefern wir                
              </div>
              <div class="home-categories-grid">
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
};

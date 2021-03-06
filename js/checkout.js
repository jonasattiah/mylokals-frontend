const isMarketPlace = true;
let stripe = {
  sdk: null,
  isSdkLoaded: false,
  card: null,
  insertSdk: () => {
    return new Promise((resolve, reject) => {
      if (stripe.isSdkLoaded) {
        return;
      }
      const scripts = document.getElementsByTagName("script")[0];
      const scriptElement = document.createElement("script");
      scriptElement.src = "https://js.stripe.com/v3/";
      scriptElement.id = "stripe-sdk";
      scripts.parentNode.insertBefore(scriptElement, scripts);
      scriptElement.onload = () => {
        resolve();
        stripe.isSdkLoaded = true;
      };
    });
  },
  initStripeCard: (clientToken, publicKey) => {
    return new Promise((resolve, reject) => {
      stripe.isSdkLoaded = false;

      const style = {
        color: "#000000",
        fontSize: "14px",
        fontFamily: "Avenir",
        fontWeight: "500",
        fontSmoothing: "antialiased",
      };

      stripe.insertSdk().then(() => {
        stripe.sdk = Stripe(publicKey, {
          locale: shopLang,
        });
        var elements = stripe.sdk.elements();

        var style = {
          base: style,
        };

        stripe.card = elements.create("card", {
          style: style,
        });
        stripe.card.mount("#card-element");
        document.getElementById("card-element").style.display = "block";
        resolve();
      });
    });
  },
  confirmCard(secret, address) {
    return new Promise((resolve, reject) => {
      stripe.sdk
        .confirmCardPayment(secret, {
          payment_method: {
            card: stripe.card,
            billing_details: {
              name: address.firstname + " " + address.lastname,
            },
          },
        })
        .then((result) => {
          if (result.error) {
            reject({ code: result.error.code });
          } else {
            if (result.paymentIntent.status === "succeeded") {
              resolve();
            }
          }
        });
    });
  },
  initSofort: (publicKey, countryCode = "DE") => {
    return new Promise(async (resolve, reject) => {
      if (stripe.isSdkLoaded) {
        return resolve();
      }
      await stripe.insertSdk().then(() => {
        stripe.sdk = Stripe(publicKey, {
          locale: countryCode,
        });
        resolve();
      });
    });
  },
  confirmSofortPayment: (clientSecret, returnUrl, countryCode = "DE") => {
    return new Promise((resolve, reject) => {
      stripe.sdk
        .confirmSofortPayment(clientSecret, {
          payment_method: {
            sofort: {
              country: countryCode,
            },
          },
          return_url: returnUrl,
        })
        .then((result) => {
          if (result.error) {
            reject({ key: "payment_stripe_" + result.error.type });
          } else {
            if (result.paymentIntent.status === "succeeded") {
              resolve();
            }
          }
        });
    });
  },
};

const checkoutView = {
  name: "checkout",
  init: () => {
    removeCookie("showFloatingBasket");
    hideFloatingBasket(true);
    const elErrors = document.getElementById("checkout-errors");
    const elPaymentErrors = document.getElementById("payment-errors");
    const elLoginBtn = document.getElementById("login-btn");
    const elCheckoutCard = document.getElementById("checkoutCard");
    const elBasket = document.getElementById("basketItems");
    const loading = (isLoading) => {
      const elFormFields = document.querySelectorAll(
        `#checkout-form .form-field-input`
      );
      if (isLoading) {
        document.getElementById("submit").disabled = true;
        document.getElementById("checkout").classList.add("is-disabled");
        elFormFields.forEach((field) => {
          field.disabled = true;
        });
      } else {
        document.getElementById("submit").disabled = false;
        document.getElementById("checkout").classList.remove("is-disabled");

        elFormFields.forEach((field) => {
          field.disabled = false;
        });
      }
    };
    const resetPaymentErrors = () => {
      elPaymentErrors.innerHTML = "";
      elPaymentErrors.style.display = "none";
    };
    const resetErrors = () => {
      elErrors.innerHTML = "";
    };
    if (window.$route.query.payment_status === "failed") {
      if (window.$route.query.payment_method === "klarna_paynow")
        elErrors.innerHTML =
          "Die Zahlung mit Klarna konnte nicht abgeschlossen werden";
    }
    const paymentWidget = document.getElementById("card-element");
    let submitButton = document.getElementById("submit");
    const setPaymentMethod = async (paymentMethod, initializationData) => {
      window.$store.payment.initializationData = initializationData;
      switch (paymentMethod) {
        case "stripe":
          await stripe.initStripeCard(
            initializationData.secret,
            initializationData.publicKey
          );
          submitButton.disabled = false;
          break;
        case "stripe_klarna_paynow":
          await stripe.initSofort(initializationData.publicKey);
          submitButton.disabled = false;
          paymentWidget.innerHTML = "Du wirst zu Klarna weitergeleitet";
          paymentWidget.style.display = "block";
          break;
        case "paypal":
          paymentWidget.innerHTML = "Du wirst zu Paypal weitergeleitet";
          paymentWidget.style.display = "block";
          submitButton.disabled = false;
          break;
        default:
          submitButton.disabled = false;
      }
    };
    function renderPaymentMethods(items) {
      items.forEach((item) => {
        const template = `
						  <input name="payment_method" value="${item.key}" type="radio">
						  <span></span>
					      <img src="${item.logo_url}" alt="${item.key}" height="24px">
					      <div class="description">${window.$t(
                  "component.payment." + item.key + ".name"
                )}</div>
					      `;

        let el = document.createElement("label");
        el.className = "list-item hover";
        el.innerHTML = template;
        if (item.selected) {
          el.querySelector("input").checked = true;
          window.$store.checkout.selectedPaymentMethod = item.key;
          el.classList.add("active");
        }
        el.addEventListener("change", () => {
          resetPaymentErrors();
          submitButton.disabled = true;
          const elPaymentMethods = document.getElementsByName("payment_method");
          for (var i = elPaymentMethods.length - 1; i >= 0; i--) {
            elPaymentMethods[i].parentElement.classList.remove("active");
          }
          el.classList.add("active");
          const paymentKey = el.querySelector("input").value;
          window.$store.checkout.selectedPaymentMethod = paymentKey;
          paymentWidget.style.display = "none";
          paymentWidget.innerHTML = "";
          api("v1/order/payment", {
            method: "POST",
            headers: {
              "order-session-id": window.$store.order.id,
            },
            body: {
              payment_key: paymentKey,
            },
          }).then((res) => {
            resetErrors();
            setPaymentMethod(
              res.data.payment_option,
              res.data.payment.initialization_data
            );
          });
        });

        document.getElementById("payment").appendChild(el);
      });
    }

    const renderShippingMethods = (items) => {
      items.forEach((item) => {
        const template = `
						  <input class="form-field-input" name="deliveryOption" value="${item.key}" type="radio" required>
						  <span></span>
					      <img src="https://cdn.purdia.com/assets/icons/default/shipping/${item.key}.svg" alt="${item.key}" height="24px">
					      <div class="description">${item.name}<span style="margin-left: 0.25rem;color: #757575;">${item._price}</span></div>
					      `;

        let el = document.createElement("label");
        el.innerHTML = template;
        if (item.selected) {
          el.querySelector("input").checked = true;
          window.$store.checkout.selectedShippingOption = item.key;
          el.classList.add("active");
        }
        el.addEventListener("change", () => {
          const elShippingOptions =
            document.getElementsByName("deliveryOption");
          for (var i = elShippingOptions.length - 1; i >= 0; i--) {
            elShippingOptions[i].parentElement.classList.remove("active");
          }
          el.classList.add("active");
          const shippingOption = el.querySelector("input").value;
          window.$store.checkout.selectedShippingOption = shippingOption;
          api("v1/order/shipping", {
            method: "PUT",
            headers: {
              "order-session-id": window.$store.order.id,
            },
            body: {
              shippingOptionKey: shippingOption,
            },
          }).then((res) => {});
        });

        document.getElementById("shipping").appendChild(el);
      });
    };

    const renderDeliveryOptions = (items) => {
      const elEditButton = document.getElementById("edit-delivery-option");
      const elDeliveryOptions = document.getElementsByName("deliveryOption");
      const selected = items.find((item) => item.selected);
      items.forEach((item) => {
        const template = `
        <input class="form-field-input" name="deliveryOption" value="${item.key}" type="radio">
        <img src="https://cdn.purdia.com/assets/icons/default/basket.svg" style="height:24px;margin-right:1rem;">
        <div class="mt-4" style="line-height: 24px;">
          <div style="font-weight: 600;">${item.name}</div>
          <div style="color: #1e5ac5;">${item.description}</div>
          <div style="font-size:14px;line-height: 14px;">${item.price}</div>
        </div>
        `;

        let el = document.createElement("label");
        el.innerHTML = template;
        el.className = "list-item list-item-l hover";
        if (item.selected) {
          el.querySelector("input").checked = true;
          el.classList.add("active");
        }
        el.addEventListener("change", () => {
          document.getElementsByName("deliveryOption").forEach((option) => {
            if (el !== option.parentElement) {
              option.parentElement.style.display = "none";
            }
          });
          elCheckoutCard.classList.remove("hidden");
          elBasket.classList.remove("hidden");
          api("v1/order/shipping", {
            method: "PUT",
            headers: {
              "order-session-id": window.$store.order.id,
            },
            body: {
              shippingOptionKey: item.key,
            },
          }).then((res) => {
            elEditButton.classList.remove("hidden");
          });
        });

        document.getElementById("deliveryOptions").appendChild(el);
      });

      elDeliveryOptions.forEach((option) => {
        if (selected.key !== option.value)
          option.parentElement.style.display = "none";
      });
      elEditButton.addEventListener("click", () => {
        elEditButton.classList.add("hidden");
        elDeliveryOptions.forEach((option) => {
          option.parentElement.style.display = "flex";
        });
      });
    };

    const fetchCheckout = () => {
      new Promise((resolve) => {
        api("v1/checkout/" + window.$store.order.id, {
          headers: {
            "basket-id": window.$store.basket.id,
            "order-session-id": window.$store.order.id,
          },
        })
          .then((res) => {
            if (!res.data.items.length)
              document.getElementById("checkoutView").classList.add("hidden");
            window.$store.order.order = res.data;
            if (res.data.user) {
              elLoginBtn.style.display = "none";
              document.getElementById("shippingFields").style.display = "none";
              document
                .getElementById("storedShippingAddress")
                .querySelector("span").innerHTML = res.data._shippingAddress;
              document.getElementById("storedShippingAddress").style.display =
                "block";
              document.getElementById("customer_email").style.display = "none";
              document.getElementById("customer_password").style.display =
                "none";
              document.getElementById("orderAsGuestRow").style.display = "none";
            }
            if (res.data.shipping_address) {
              document.getElementById("shipping_firstname").value =
                res.data.shipping_address.firstname;
              document.getElementById("shipping_lastname").value =
                res.data.shipping_address.lastname;
              document.getElementById("shipping_street").value =
                res.data.shipping_address.street;
              document.getElementById("shipping_zip_code").value =
                res.data.shipping_address.postalCode;
              document.getElementById("shipping_city").value =
                res.data.shipping_address.city;
              document.getElementById("shipping_country").value =
                res.data.shipping_address.country;
            }
            renderPaymentMethods(res.data.payment_methods);
            if (res.data.payment) {
              setPaymentMethod(
                res.data.paymentMethod,
                res.data.payment.initialization_data
              );
            }
            if (isMarketPlace) {
              renderDeliveryOptions(res.data.shippingMethods);
            } else {
              renderShippingMethods(res.data.shippingMethods);
            }
            if (res.data.itemPickUpLocations.length && false) {
              initMap(
                "map",
                [
                  res.data.itemPickUpLocations[0].coordinates.lat,
                  res.data.itemPickUpLocations[0].coordinates.lng,
                ],
                10
              );
              setTimeout(() => {
                addMarkers(
                  res.data.itemPickUpLocations.map((item) => ({
                    ...item,
                    coordinates: [item.coordinates.lng, item.coordinates.lat],
                  }))
                );
              }, 500);
            }
            if (res.data.deliveryOption) {
              elCheckoutCard.classList.remove("hidden");
            } else {
              elBasket.classList.add("hidden");
            }
            document.getElementById("order-total").innerHTML =
              res.data.order_total;
            if (res.data.shippingCosts) {
              document
                .getElementById("shipping-costs")
                .querySelector(".shipping-costs").innerHTML =
                res.data._shippingCosts;
              document
                .getElementById("shipping-costs")
                .classList.remove("hidden");
            }
          })
          .catch((err) => {
            if ([404, 422].includes(err.status)) {
              api("v1/order", {
                method: "POST",
                headers: {
                  "basket-id": window.$store.basket.id,
                },
              })
                .then((res) => {
                  setCookie("orderSessionId", res.data.id);
                  window.$store.order.id = res.data.id;
                  fetchCheckout();
                })
                .catch((err) => {
                  if (err.data.errors.basketId) {
                    changeRoute("/basket");
                  }
                });
            }
          });
      });
    };

    document
      .getElementById("shippingAddressEdit")
      .addEventListener("click", () => {
        document.getElementById("storedShippingAddress").style.display = "none";
        document.getElementById("shippingFields").style.display = "block";
      });

    fetchCheckout();

    function renderItems(items) {
      document.querySelector("#items skeleton").remove();
      items.forEach((item) => {
        const template = `
					    	<div class="prdct-itm" route="/product/${item.key}">
					    		<div class="prdct-itm_img">
					    			<img src="${item.image_url}?height=330&width=310&size=1"/>
					    		</div>
					    		<div class="prdct-itm-details">
					    			<div class="item-name">${item.variant.name}</div>
					    			<div class="item-price">${item.variant._priceWithTax}</div>
					    		</div>
					    	</div>
					      `;

        let component = document.createElement("div");
        component.innerHTML = template;
        component.classList.add("item");

        document.getElementById("items").appendChild(component);
      });
    }

    // if (window.$store.basket.items) {
    // 	renderItems(window.$store.basket.items);
    // } else {
    // 	console.log(window.$store.basket)
    // 	basketApi.fetchBasket().then((basket) => {
    //    renderItems(basket.items);
    //  });
    // }

    const ERROR_MESSAGES = {
      badInput: "badInput",
      customError: "customError",
      patternMismatch: "patternMismatch",
      rangeOverflow: "rangeOverflow",
      rangeUnderflow: "rangeUnderflow",
      stepMismatch: "stepMismatch",
      tooLong: "tooLong",
      tooShort: "error.tooShort",
      typeMismatch: "error.fieldCheckValue",
      valid: "valid",
      valueMissing: "error.field_required",
      field_check_value: "error.fieldCheckValue",
      field_min_2_letters: "error.tooShort",
      field_required: "Dies ist ein Pflichtfeld",
      field_invalid_email_format: "error.field_invalid_email_format",
      account_already_exists: "error.account_already_exists",
    };

    const ErrorMessage = (validity) => {
      let component = document.createElement("div");
      component.className = "error-message checkout-field-error";

      const messages = [];
      validity.forEach((v) => {
        messages.push(window.$t(ERROR_MESSAGES[v]));
      });

      if (!validity.valid) component.innerHTML = messages.join(", ");

      return component;
    };

    const onSubmit = async (e) => {
      resetPaymentErrors();
      document.getElementById("shipping-error").innerHTML = "";
      document.querySelectorAll(".checkout-field-error").forEach((item) => {
        if (item) item.remove();
      });

      const validation = {
        valid: false,
        items: [],
      };

      document
        .querySelectorAll(`#checkout-form .form-field-input`)
        .forEach((field) => {
          const { validity } = field;
          if (!validation.items.find((item) => item.id === field.name)) {
            validation.items[field.name] = {
              id: field.name,
              validation: Object(validity),
            };
          }
          if (!validity.valid) {
            const errors = [];
            for (let item in validity) {
              if (validity[item]) {
                errors.push(item);
              }
            }
            if (field.type !== "radio") {
              field.parentElement.append(ErrorMessage(errors));
            }
          }
        });

      if (window.$store.order.order.user) {
        validation.items["email"] = null;
        validation.items["password"] = null;
      }

      validation.valid = !Boolean(
        Object.keys(validation.items.filter((item) => item)).filter(
          (item) => !validation.items[item].validation.valid
        ).length
      );

      if (validation.items.deliveryOption.validation.valueMissing) {
        document.getElementById("shipping-error").innerHTML =
          "Bitte w??hle eine Versandart";
      }

      const clearSessions = () => {
        window.$store.basket.id = null;
        window.$store.basket.basket = null;
        removeCookie("basketId");
        window.$store.order.id = null;
        removeCookie("orderSessionId");
        document.getElementById("basketItemCount").style.display = "none";
      };

      const confirmOrder = () => {
        api("v1/order/confirm", {
          method: "POST",
          headers: {
            "order-session-id": window.$store.order.id,
          },
        })
          .then((res) => {
            switch (window.$store.checkout.selectedPaymentMethod) {
              case "paypal":
                if (res.data.action_required) {
                  return (window.location = res.data.payment_callback_url);
                }
                break;
              case "invoice":
                if (res.status === 201) {
                  clearSessions();
                  return changeRoute("/order?k=" + res.data.order_key);
                }
                break;
              case "stripe":
                if (res.status === 201) {
                  clearSessions();
                  return changeRoute("/order?k=" + res.data.order_key);
                }
                break;
              default:
            }
          })
          .catch((err) => {
            if (err.data && err.data.errors) {
              if (err.data.errors.paymentMethod)
                document
                  .getElementById("checkout-errors")
                  .appendChild(
                    document.createTextNode(
                      window.$t(
                        "error.payment_" + err.data.errors.paymentMethod
                      )
                    )
                  );
              loading(false);
            }
          });
      };

      const failOrder = (err) => {
        if (err.data.errors.register) {
          if (err.data.errors.register.email)
            document
              .getElementById("customer_email")
              .parentElement.append(
                ErrorMessage(err.data.errors.register.email)
              );
          if (err.data.errors.register.password)
            document
              .getElementById("customer_password")
              .parentElement.append(
                ErrorMessage(err.data.errors.register.password)
              );
        }
        err.data.errors.guest
          ? document
              .getElementById("customer_email")
              .parentElement.append(ErrorMessage(err.data.errors.guest.email))
          : null;
        if (err.data.errors.shippingAddress) {
          Object.keys(err.data.errors.shippingAddress).forEach((error) => {
            if (document.getElementById("shipping_" + error)) {
              document
                .getElementById("shipping_" + error)
                .parentElement.append(
                  ErrorMessage(err.data.errors.shippingAddress[error])
                );
            }
          });
        }
        loading(false);
      };

      const updateOrder = () => {
        return new Promise((resolve, reject) => {
          const form = getFormData("checkout-form");
          let customerModel = null;
          if (!window.$store.order.order.user && !form.orderAsGuest) {
            customerModel = {
              register: {
                email: form.customer_email,
                password: form.customer_password,
              },
            };
          } else if (form.orderAsGuest) {
            customerModel = {
              orderAsGuest: form.orderAsGuest,
              guest: {
                email: form.customer_email,
              },
            };
          }
          api("v1/order/data", {
            method: "PUT",
            headers: {
              "order-session-id": window.$store.order.id,
              "country-locale-code": "DE",
            },
            body: {
              address: {
                shipping: {
                  firstname: form.shipping_firstname,
                  lastname: form.shipping_lastname,
                  street: form.shipping_street,
                  postalCode: form.shipping_zip_code,
                  city: form.shipping_city,
                  country: form.shipping_country,
                },
              },
              ...customerModel,
            },
          })
            .then((res) => {
              if (res.data.user) {
                setCookie("accessToken", res.data.user.token);
                window.$store.auth.token = res.data.user.token;
              }
              switch (window.$store.checkout.selectedPaymentMethod) {
                case "stripe_klarna_paynow":
                  return stripe.confirmSofortPayment(
                    res.data.payment.initialization_data.clientSecret,
                    res.data.payment.initialization_data.returnUrl
                  );
                  break;
                default:
              }
              if (res.status === 200) {
                resolve();
              }
            })
            .catch((err) => {
              failOrder(err);
            });
        });
      };

      if (validation.valid) {
        loading(true);
        updateOrder().then(() => {
          if (window.$store.checkout.selectedPaymentMethod === "stripe") {
            stripe
              .confirmCard(
                window.$store.payment.initializationData.secret,
                window.$store.order.order.shipping_address
              )
              .then(() => {
                confirmOrder();
              })
              .catch((err) => {
                elPaymentErrors.appendChild(
                  document.createTextNode(
                    window.$t("error.payment.stripeCard." + err.code)
                  )
                );
                elPaymentErrors.style.display = "block";
                loading(false);
                return;
              });
          } else {
            confirmOrder();
          }
        });
      }
    };

    submitButton.addEventListener("click", () => {
      onSubmit();
    });

    document.getElementById("orderAsGuest").addEventListener("change", (e) => {
      const fieldPassword = document.getElementById("customer_password");
      if (e.target.checked) {
        fieldPassword.style.display = "none";
        fieldPassword.removeAttribute("required");
      } else {
        fieldPassword.style.display = "block";
        fieldPassword.setAttribute("required", "");
      }
    });

    elLoginBtn.addEventListener("click", () => {
      elLoginBtn.style.display = "none";
      renderLoginForm("login-form", () => {
        window.location.reload();
      });
    });

    // renderDeliveryOptions([
    //   {
    //     key: 'pickUp',
    //     name: "Selber abholen (2km entfernt)",
    //     description: "100% CO2 sparen",
    //     price: "Kostenlos"
    //   },
    //   {
    //     key: 'delivery',
    //     name: "Lieferung",
    //     description: "Heute 17:00 - 19:00 Uhr",
    //     price: "1,99 ???"
    //   },
    //   {
    //     key: 'primeDelivery',
    //     name: "Premium Lieferung",
    //     description: "ca. 30 min.",
    //     price: "6,99 ???"
    //   },
    // ])
  },
  template: `
				    <div class="checkout-view md:block" id="checkout">
            <form id="checkout-form" action="javascript:;" autocomplete="on" novalidate>
            <!-- Modul:Start -->
            <!--<div class="map" id="map" style="max-width: 600px;margin-bottom: 1rem;"></div>-->
            <div style="position:relative;max-width: 600px;">
              <ul class="list" style="position:relative;margin-bottom: 1rem;" id="deliveryOptions"></ul>
              <div class="button btn-xs btn-gray" style="position: absolute;z-index: 10;bottom: 0.5rem;right: 0.5rem;font-size: 14px;" id="edit-delivery-option">??ndern</div>
            </div>
            <!-- Modul:End -->
						<div class="card p-3 hidden" style="max-width: 600px;position:relative;" id="checkoutCard">
              <div class="button btn-gray" style="margin-bottom: 1rem;width:100%;" id="login-btn">Login</div>
              <div id="login-form"></div>
							
								<!--
								<div class="items flex overflow" id="items" style="border-radius: 4px;">
									<skeleton style="width: 100%;height:114px;border-radius: 4px;background: #fff;"></skeleton>
								</div>
								-->

								<div class="mt-4" style="font-weight: 600;margin-bottom: 0.5rem">${window.$t(
                  "view.checkout.shipping.headline"
                )}</div>		
								<div class="card-plain" id="storedShippingAddress" style="display:none;font-size: 14px;">
                  <span></span>
                  <a id="shippingAddressEdit" style="cursor:pointer;">??ndern</a>
                </div>
								<div id="shippingFields">
								<div class="mt-4 flex form-group">
									<div class="w-1/2">
										<div class="form-field">
											<input class="form-field-input" name="firstname" id="shipping_firstname" placeholder="${window.$t(
                        "form.field.firstname"
                      )}" minlength="2" required>
										</div>
									</div>
									<div class="w-1/2 pl-2">
										<div class="form-field">
											<input class="form-field-input" name="lastname" id="shipping_lastname" placeholder="${window.$t(
                        "form.field.lastname"
                      )}" minlength="2" required>
										</div>
									</div>
								</div>
								<div class="mt-4">
									<div class="form-field">
										<input class="form-field-input" name="street" id="shipping_street" placeholder="${window.$t(
                      "form.field.street"
                    )}" required>
									</div>
								</div>
								<div class="mt-4 flex form-group">
									<div class="w-1/3">
										<div class="form-field">
											<input class="form-field-input" name="zipCode" id="shipping_zip_code" placeholder="${window.$t(
                        "form.field.zipCode"
                      )}" required>
										</div>
									</div>
									<div class="w-2/3 pl-2">
										<div class="form-field">
											<input class="form-field-input" name="city" id="shipping_city" placeholder="${window.$t(
                        "form.field.city"
                      )}" required>
										</div>
									</div>
								</div>
								<div class="mt-4">
									<div class="form-field">
										<select class="form-field-input" name="country" id="shipping_country">
											<option value="DE">Germany</option>
											<option value="CH">Swiss</option>
										</select>
									</div>
								</div>
								<div class="mt-4">
									<div class="form-field">
										<input class="form-field-input" name="email" id="customer_email" placeholder="${window.$t(
                      "form.field.email"
                    )}" type="email" required>
									</div>
								</div>
								<div class="mt-4">
									<div class="form-field">
										<input class="form-field-input" name="password" id="customer_password" placeholder="${window.$t(
                      "form.field.password"
                    )}" type="password" required>
									</div>
								</div>

								<div class="mt-4" id="orderAsGuestRow">
									<label>
										<input class="form-field-input" type="checkbox" name="orderAsGuest" id="orderAsGuest">
										<span></span>
										${window.$t("view.checkout.orderAsGuest")}
									</label>
								</div>
								</div>

								<div class="mt-4" style="font-weight: 600;margin-bottom: 0.5rem;margin-top: 1rem">${window.$t(
                  "view.checkout.payment.headline"
                )}</div>
								<ul class="list-grid list-payment" id="payment"></ul>
								<div id="card-element" style="display:none;"></div>
                <div class="error-message" id="payment-errors" style="margin-top: 0.25rem;"></div>

                ${
                  !isMarketPlace
                    ? `<div class="mt-4" style="font-weight: 600;margin-bottom: 0.5rem;margin-top: 1rem">${window.$t(
                        "view.checkout.shippingOption.headline"
                      )}</div>
                <div class="form-card-select form-field" id="shipping"></div>`
                    : ""
                }
                <div class="error-message" id="shipping-error"></div>
								
                
								<!--
								<div class="mt-4">
									<label>
										<input type="checkbox">
										<span></span>
										Mit deiner Bestellung erkl??rst du dich mit unseren AGB's, Widerrufsbestimmungen und Datenschutzbestimmungen einverstanden.
									</label>
								</div>
								-->

								<div class="text-right" style="margin-top: 2rem;">
                  <div class="hidden" style="font-size: 14px;" id="shipping-costs">
                    <span class="mt-4" style="margin-right: .25rem;">${window.$t(
                      "view.checkout.order.shippingCosts"
                    )}</span>
                    <span class="mt-4 text-right">
                      <span class="shipping-costs" style="font-weight: 600;">
                        
                      </span>
                    </span>
                  </div>
									<div>
										<span class="mt-4" style="margin-right: .25rem;">${window.$t(
                      "view.checkout.order.total"
                    )}</span>
										<span class="mt-4 text-right">
											<span style="font-weight: 600;" id="order-total">
												
											</span>
										</span>
									</div>
									<div style="font-size: 10px;">${window.$t("view.checkout.order.incVat")}</div>
								</div>

								<div class="error-message" id="checkout-errors"></div>

								<div style="margin-top: 1rem;">
									<button class="button btn-l w-full" id="submit">
										${window.$t("view.checkout.submitOrder.button")}
									</button>
								</div>
							
						</div>
            </form>
					</div>
				`,
};

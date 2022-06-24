class UiDropdown extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    var template = `
    <div class="ui-dropdown" style="">
      <div class="ui-dropdown-toggle"><slot></slot></div>
      <div class="ui-dropdown-body h-full"><div class="nav-item-dropdown__inner"><slot name="body"></slot></div></div>
    </div>
    <style>
    .ui-dropdown-body {
      background: #fff;
      top: 0;
      -webkit-box-shadow: 0 7px 9px rgb(0 0 0 / 10%);
      box-shadow: 0 7px 9px rgb(0 0 0 / 10%);
      height: 100%;
      width: 50%;
      left: 0;
      border-bottom-right-radius: 6px;
      overflow-y: scroll;
      overflow-x: hidden;
      position: fixed;
      z-index: 30;
      display: none;
    }
    </style>
    `;
    this.shadowRoot.innerHTML = template;

    const dropdownBody = this.shadowRoot.querySelector(".ui-dropdown-body");
    const dropdownToggle = this.shadowRoot.querySelector(".ui-dropdown-toggle");
    dropdownToggle.addEventListener("click", () => {
      dropdownBody.style.display = "block";
    });
    window.addEventListener("mouseup", function (event) {
      if (
        event.target != dropdownBody &&
        event.target.parentNode != dropdownBody
      ) {
        dropdownBody.style.display = "none";
      }
    });
  }
}

window.customElements.define("ui-dropdown", UiDropdown);

export const createElement = (tagName, text = "", className = "") => {
  const element = document.createElement(tagName);
  element.innerHTML = text;
  if (className) {
    element.classList.add(className);
  }
  return element;
};

const createInputOrSelect = (type, name, required, options) => {
  const element =
    type === "select"
      ? document.createElement("select")
      : document.createElement("input");
  element.name = name;
  element.required = required;

  if (type !== "select") {
    element.type = type;
  }

  if (type === "select" && options) {
    options.forEach((option) => {
      const optionElement = createElement("option", option);
      optionElement.value = option;
      element.appendChild(optionElement);
    });
  }

  return element;
};

export const createInput = (inputConfig, column) => {
  const {
    label = column.title,
    name = column.value,
    type = "text",
    required = true,
    options = [],
  } = inputConfig;

  const labelElement = createElement("label", `${label}: `, "form-label");
  const input = createInputOrSelect(type, name, required, options);
  labelElement.appendChild(input);
  return labelElement;
};

export const createForm = (config, submitFn) => {
  const modalWrapper = createElement("div", "", "modal-wrapper");
  const form = createElement("form", "", "create-form");
  const sendBtn = createElement("Button", "Відправити");
  const closeBtn = createElement("Button", "X", "closeBtn");

  closeBtn.onclick = (e) => {
    e.preventDefault();
    modalWrapper.remove();
  };

  form.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      if (isNaN(value)) {
        data[key] = value;
      } else {
        data[key] = parseInt(value);
      }
    });
    submitFn(data);
    modalWrapper.remove();
  };

  config.columns.forEach((column) => {
    const inputs = Array.isArray(column.input) ? column.input : [column.input];
    inputs.forEach((inputConfig) => {
      const input = createInput(inputConfig, column);
      form.appendChild(input);
    });
  });

  form.appendChild(sendBtn);
  form.appendChild(closeBtn);
  modalWrapper.appendChild(form);
  return modalWrapper;
};

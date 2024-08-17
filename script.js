import { fetchData, deleteData, createPost } from "./services.js";
import { createElement, createForm } from "./createForm.js";

const baseUrl = "https://mock-api.shpp.me/ochumachenko";
const problemMessage = "There was a problem with the fetch operation:";

const createButton = (text, clickHandler) => {
  const button = createElement("button", text);
  button.onclick = clickHandler;
  return button;
};

const createDeleteButton = (deleteId, clickHandler) => {
  const deleteBtn = createButton("Видалити", clickHandler);
  deleteBtn.setAttribute("data-delete-id", deleteId);
  return deleteBtn;
};

const createEditButton = (editId, clickHandler) => {
  const editBtn = createButton("Редагувати", clickHandler);
  editBtn.setAttribute("data-edit-id", editId);
  return editBtn;
};

const createAddBtn = (config, updateFn) => {
  const addBtn = createElement("button", "Додати новий запис");
  addBtn.onclick = async (e) => {
    e.preventDefault();
    document.body.appendChild(
      createForm(config, async (data) => {
        await createPost(config.apiUrl, data);
        updateFn();
      })
    );
  };
  return addBtn;
};

const createTableRow = (config, item, key, state) => {
  const tr = document.createElement("tr");
  config.columns.forEach((column) => {
    const cellValue =
      typeof column.value === "function"
        ? column.value(item)
        : item[column.value];
    tr.appendChild(createElement("td", cellValue));
  });

  const deleteBtn = createDeleteButton(key, async (e) => {
    const id = e.target.getAttribute("data-delete-id");
    if (id) {
      const result = await deleteData(`${config.apiUrl}/${id}`);
      if (!result) return;
      state.getData();
    }
  });

  const editBtn = createEditButton(key, (e) => {
    // todo 
    console.log("Може колись і додам але мені лінь 😄");
  });

  const ti = createElement("td", "");
  ti.appendChild(deleteBtn);
  ti.appendChild(editBtn);
  tr.appendChild(ti);

  return tr;
};

const createTableHead = (config, state) => {
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");

  config.columns.forEach((column) => {
    tr.appendChild(createElement("th", column.title));
  });

  tr.appendChild(createElement("th", "action"));

  thead.appendChild(tr);

  if (config.columns.some((item) => "input" in item)) {
    thead.appendChild(createAddBtn(config, state.getData));
  }

  return thead;
};

const createTableBody = (config, state) => {
  const tbody = document.createElement("tbody");
  for (const key in state.data) {
    tbody.appendChild(createTableRow(config, state.data[key], key, state));
  }
  return tbody;
};

const createTable = (config, state) => {
  if (!state) createElement("span", problemMessage);
  const table = document.createElement("table");
  table.appendChild(createTableHead(config, state));
  table.appendChild(createTableBody(config, state));
  return table;
};

const render = (selector, table) => {
  const wrapper = document.querySelector(selector);
  wrapper.innerHTML = "";
  wrapper.appendChild(table);
};

const DataTable = async (config) => {
  const state = {
    data: {},
    getData: async function () {
      const { data } = await fetchData(config.apiUrl);
      this.setData(data);
    },
    setData: function (data) {
      this.data = data;
      const table = createTable(config, this);
      render(config.parent, table);
    },
  };
  state.getData = state.getData.bind(state);

  const { data } = await fetchData(config.apiUrl);
  state.data = data;
  const table = createTable(config, state);
  render(config.parent, table);
};

// usage

const getColorLabel = (color) => {
  const label = `<div class="color-label" style="width: 100%; height: 20px; background-color: ${color};"></div>`;
  return label;
};

const getAge = (userBirthday) => {
  const today = new Date();
  const birthDate = new Date(userBirthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

const config1 = {
  parent: "#usersTable",
  columns: [
    { title: "Ім’я", value: "name" },
    { title: "Прізвище", value: "surname" },
    { title: "Вік", value: (user) => getAge(user.birthday) },
    {
      title: "Фото",
      value: (user) =>
        `<img src="${user.avatar}" alt="${user.name} ${user.surname}"/>`,
    },
  ],
  apiUrl: `${baseUrl}/users`,
};

const config2 = {
  parent: "#productsTable",
  columns: [
    {
      title: "Назва",
      value: "title",
      input: { type: "text" },
    },
    {
      title: "Ціна",
      value: (product) => `${product.price} ${product.currency}`,
      input: [
        { type: "number", name: "price", label: "Ціна" },
        {
          type: "select",
          name: "currency",
          label: "Валюта",
          options: ["$", "€", "₴"],
          required: false,
        },
      ],
    },
    {
      title: "Колір",
      value: (product) => getColorLabel(product.color), // функцію getColorLabel вам потрібно створити
      input: { type: "color", name: "color" },
    },
  ],
  apiUrl: `${baseUrl}/products`,
};

DataTable(config1);
DataTable(config2);

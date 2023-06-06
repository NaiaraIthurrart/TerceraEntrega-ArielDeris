const express = require("express");
const fs = require("fs");

const app = express();
const port = 3000;

class ProductManager {
  constructor(path) {
    this.path = path;
    this.products = [];
    this.nextId = 1;
    this.load();
  }

  addProduct(product) {
    if (this.products.some((p) => p.code === product.code)) {
      console.log(`Error: El producto con código ${product.code} ya existe`);
      return;
    }

    const newProduct = { id: this.nextId++, ...product };
    this.products.push(newProduct);
    this.save();
  }

  getProducts() {
    this.load();
    return this.products;
  }

  getProductById(id) {
    this.load();
    const product = this.products.find((p) => p.id === id);
    if (product) {
      return product;
    } else {
      console.log("Error: Producto no encontrado");
      return null;
    }
  }

  updateProduct(id, product) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.products[index] = { id, ...product };
      this.save();
    } else {
      console.log(`Error: Producto con id ${id} no encontrado`);
    }
  }

  deleteProduct(id) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.products.splice(index, 1);
      this.save();
    } else {
      console.log(`Error: Producto con id ${id} no encontrado`);
    }
  }

  load() {
    try {
      const data = fs.readFileSync(this.path);
      this.products = JSON.parse(data);
      this.nextId = this.products.length + 1;
    } catch (error) {
      console.log(`Error al cargar archivo: ${error}`);
    }
  }

  save() {
    try {
      fs.writeFileSync(this.path, JSON.stringify(this.products));
    } catch (error) {
      console.log(`Error al guardar archivo: ${error}`);
    }
  }
}

const manager = new ProductManager("./products.json");


manager.addProduct({
  title: "Televisor",
  description: "Televisor de 42 pulgadas",
  price: 40000,
  thumbnail: "/",
  code: "PRO1",
  stock: 20,
});

manager.addProduct({
  title: "Licuadora",
  description: "Licuadora y procesadora multifunción",
  price: 30000,
  thumbnail: "/",
  code: "PRO2",
  stock: 20,
});


app.get("/products", (req, res) => {
  const { limit } = req.query;
  const products = manager.getProducts();

  if (limit) {
    const limitedProducts = products.slice(0, Number(limit));
    res.json(limitedProducts);
  } else {
    res.json(products);
  }
});

app.get("/products/:pid", (req, res) => {
  const { pid } = req.params;
  const product = manager.getProductById(Number(pid));

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: "Producto no encontrado" });
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

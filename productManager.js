const fs = require('fs');
const filePath = 'products.json';

// CREA EL ARCHIVO EN CASO DE NO EXISTIR
if (!fs.existsSync(filePath)) {
  fs.writeFileSync(filePath, '[]', 'utf-8');
  console.log(`Se creo ${filePath}`);
}

class ProductManager {
  constructor(filePath) {
    this.path = filePath;
    this.products = [];
    this.lastProductId = 0;
    this.loadProducts();
  }

  // CARGA LOS PRODUCTOS
  async loadProducts() {
    try {
      const data = await fs.promises.readFile(this.path, 'utf-8');
      this.products = JSON.parse(data);
      this.updateLastProductId();
    } catch (error) {
      console.log('Error: No se pudieron cargar los productos', error.message);
      return null;
    }
  }

  // GUARDA LOS PRODUCTOS
  async saveProducts(data) {
    try {
      const newData = JSON.stringify(data, null, 2);
      await fs.promises.writeFile(this.path, newData, 'utf-8');
      console.log('Se guardaron los productos exitosamente', this.path);
    } catch (error) {
      console.log('Error: No se pudieron guardar los productos', error.message);
      return null;
    }
  }

    // AÑADIR PRODUCTOS
    addProduct(product) {
        if (
          !product.title ||
          !product.description ||
          !product.price ||
          !product.thumbnail ||
          !product.code ||
          !product.stock
        ) {
          console.log('Porfavor rellena todos los campos.');
          return;
        }
    
        // CHEQUEAR CODIGOS REPETIDOS
        if (this.products.some((p) => p.code === product.code)) {
          console.log(`Error: El codigo ${product.code} ya existe.`);
          return;
        }
    
        this.lastProductId++;
        product.id = this.lastProductId;
        this.products.push(product);
    
        this.saveProducts(this.products)
          .then(() => {
            console.log(`Se agrego el producto: ${product.title}`);
          })
          .catch((error) => {
            console.log('Error: Los productos no se pudieron guardar', error.message);
          });
    
        return product;
      }

  updateLastProductId() {
    if (this.products.length > 0) {
      const lastProduct = this.products[this.products.length - 1];
      this.lastProductId = lastProduct.id;
    }
  }

  async getProducts() {
    await this.loadProducts();
    return this.products;
  }

// CAMBIAR TITULO DEL PRODUCTO
async updateProduct(id, updatedTitle) {
    const productToUpdate = this.products.find((p) => p.id === id);
    if (!productToUpdate) {
      console.log(`Error: Producto de id ${id} no existe`);
      return;
    }

    productToUpdate.title = updatedTitle;

    await this.saveProducts(this.products)
      .then(() => {
        console.log(`Se actualiza el producto: ${JSON.stringify(productToUpdate)}`);
      })
      .catch((error) => {
        console.log('Error al guardar los productos', error.message);
      });
  }

  // OBTENER PRODUCTO MEDIANTE ID
  async getProductById(id) {
    await this.loadProducts();
    const product = this.products.find((p) => p.id === id);
    if (product) {
      return product;
    } else {
      console.log('Error: Producto inexistente');
      return null;
    }
  }

  // BUSCAR Y ELIMINAR PRODUCTOS
  async deleteProduct(id) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      const deletedProduct = this.products.splice(index, 1)[0];
      await this.saveProducts(this.products)
        .then(() => {
          console.log(`Producto eliminado: ${deletedProduct.title}`);
        })
        .catch((error) => {
          console.log('Error: No se pudo guardar los productos', error.message);
        });
    } else {
      console.log('Error: Producto inexistente.');
      return null;
    }
  }
}

async function testing() {
  const productManagerInstance = new ProductManager(filePath);

  console.log("getProducts:\n", await productManagerInstance.getProducts());

  await productManagerInstance.addProduct({
    title: "The Car",
    description: "Arctic Monkeys",
    price: 12000,
    thumbnail: "ruta/tcam.jpg",
    code: "A007",
    stock: 9,
    id: null
  });

  await productManagerInstance.addProduct({
    title: "Hot Fuss",
    description: "The Killers",
    price: 15000,
    thumbnail: "ruta/.jpg",
    code: "A008",
    stock: 8,
    id: null
  });

  await productManagerInstance.addProduct({
    title: "The New Abnormal",
    description: "The Strokes",
    price: 10000,
    thumbnail: "ruta/tna.jpg",
    code: "A009",
    stock: 6,
    id: null
  });

  console.log("getProducts con productos nuevos:", await productManagerInstance.getProducts());

  const nonExistentProduct = await productManagerInstance.getProductById(17);
  console.log("Error: Producto inexistente");

  const initialProducts = await productManagerInstance.getProducts();
  console.log("Listado de productos iniciales:", initialProducts);

  // NEW PRODUCT
  const newProduct = {
    title: "Abbey Road",
    description: "The Beatles",
    price: 9999,
    thumbnail: "ruta/artb.jpg",
    code: "A010",
    stock: 2,
  };
  await productManagerInstance.addProduct(newProduct);

  const productId = 2;
  const productById = await productManagerInstance.getProductById(productId);
  console.log(`Producto de id buscado ${productId}`);
  console.log("Producto encontrado:", productById);

  const productIdToUpdate = 4;
  await productManagerInstance.updateProduct(productIdToUpdate, "Producto actualizado");
  const productsAfterUpdate = await productManagerInstance.getProducts();
  console.log("Listado con producto actualizado:", productsAfterUpdate);

  const productsAfterAdd = await productManagerInstance.getProducts();
  console.log("Listado con producto nuevo:", productsAfterAdd);

  const productIdToDelete = 2;
  await productManagerInstance.deleteProduct(productIdToDelete);

  const productsAfterDelete = await productManagerInstance.getProducts();
  console.log("Listado sin el producto eliminado:", productsAfterDelete);
}

testing();

CREATE DATABASE tienda_online;
USE tienda_online;

-- Tabla de usuarios
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(50) NOT NULL,
    apellido_materno VARCHAR(50),
    correo VARCHAR(100) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    rol ENUM('cliente', 'vendedor', 'admin_tienda', 'superadmin') NOT NULL
);

-- Tabla de direcciones
CREATE TABLE direcciones (
    id_direccion INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    calle VARCHAR(255) NOT NULL,
    numero_exterior VARCHAR(10) NOT NULL,
    numero_interior VARCHAR(10),
    colonia VARCHAR(100) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    estado VARCHAR(100) NOT NULL,
    codigo_postal VARCHAR(10) NOT NULL,
    pais VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabla de categorías
CREATE TABLE categorias (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

-- Tabla de productos
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    categoria_id INT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id_categoria) ON DELETE CASCADE
);

-- Tabla de atributos para ropa
CREATE TABLE atributos_ropa (
    id_atributo INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    talla ENUM('XS', 'S', 'M', 'L', 'XL', 'XXL') NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
);

-- Tabla de atributos para joyería
CREATE TABLE atributos_joyeria (
    id_atributo INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    tipo ENUM('anillo', 'collar', 'pulsera', 'aretes', 'reloj') NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
);

-- Tabla de atributos para gorras
CREATE TABLE atributos_gorras (
    id_atributo INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    color VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
);

-- Tabla de imágenes de productos
CREATE TABLE imagenes_productos (
    id_imagen INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    url_imagen VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
);

-- Tabla del carrito de compras
CREATE TABLE carrito (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    estado ENUM('pendiente', 'finalizado') NOT NULL DEFAULT 'pendiente',
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabla de items del carrito
CREATE TABLE carrito_items (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    FOREIGN KEY (id_carrito) REFERENCES carrito(id_carrito) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
);

-- Tabla de pedidos
CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'pagado', 'enviado', 'entregado') NOT NULL DEFAULT 'pendiente',
    metodo_pago ENUM('mercado_pago', 'paypal', 'en_tienda') NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- Tabla de detalle de pedidos
CREATE TABLE detalle_pedido (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido) ON DELETE CASCADE,
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE
);

-- Tabla de descuentos
CREATE TABLE descuentos (
    id_descuento INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NULL,
    id_categoria INT NULL,
    porcentaje DECIMAL(5,2) NOT NULL CHECK (porcentaje > 0 AND porcentaje <= 100),
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    CHECK (id_producto IS NOT NULL OR id_categoria IS NOT NULL),
    FOREIGN KEY (id_producto) REFERENCES productos(id_producto) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria) ON DELETE CASCADE
);

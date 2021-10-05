const express = require('express');
const aplicacion = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const constantes = require('constants');


var pool = mysql.createPool({
    connectionLimit: 20,
    host: 'localhost',
    user: 'root',
    password: '2972',
    database: 'inventario'
});

//aplicacion.set('view engine', 'ejs');

aplicacion.use(bodyParser.json());
aplicacion.use(bodyParser.urlencoded({ extended: true }));
//aplicacion.use(express.static('public'));

/**
 * Find a producto with parametters, use id
 * parametters: ruta, internal function
 * return:  id is used for find product, a product data is getted.
 * in other way code 404 is getted and sended a error message on 
 * json file for be viewed on the browser.
 */
aplicacion.get("/api/inventario/producto/:id", function(peticion, respuesta) {
    pool.getConnection(function(err, connection) {
        let query = `SELECT id, nombre, precio, cantidad FROM producto WHERE id=${connection.escape(peticion.params.id)} ORDER BY precio ASC`
        connection.query(query, function(error, filas, campos) {
            if (filas.length > 0) {
                respuesta.json({
                    data: filas[0]
                });
            } else {
                respuesta.status(404);
                respuesta.send({
                    errors: ["Error 404 - Producto No Encontrado."]
                })
            }

        });
        connection.release();
    })
})

/**
 * Lista los productos, segun una consulta por campos
 * parametros: ruta, funcion interna de busqueda
 * retorna: Lista de productos segun orden de campos entregada.
 * deprecado: en caso contrario actualiza el estado a 404  y envia un mensaje de error como json file.
 */
aplicacion.get('/api/inventario/productos', function(peticion, respuesta) {
    /*
        A path valid is this type: /api/[sistema]/[subsistema]/?orden=[id || nombre || cantidad || precio] 
        For example the path '/api/inventario/productos?orden=precio' the productos list´s is ordered by  
        precio and  file json is showed on the browser. 
     */

    //API REST - GET Method - parametters are used 
    pool.getConnection(function(err, connection) {
        //parametters used here for order by...
        let query = `SELECT * FROM producto ORDER BY nombre ASC;`;
        if (peticion.query.orden == "precio") {
            query = `SELECT * FROM producto ORDER BY precio ASC;`;
        } else if (peticion.query.orden == "cantidad") {
            query = `SELECT * FROM producto as p ORDER BY p.cantidad ASC;`;
        } else if (peticion.query.orden == "id") {
            query = `SELECT * FROM producto ORDER BY id ASC;`;
        } else {
            query = `SELECT * FROM producto ORDER BY nombre ASC;`;
        }
        connection.query(query, function(error, filas, campos) {
            //I have data in filas(length >0), use:
            respuesta.json({ data: filas });

            // Connection is Disabled now
            connection.release();
        })
    })
})

/**
 * Actualiza el puerto de escucha
 * parametros:
 * puerto de escucha, funcion interna
 */
aplicacion.listen(8080, function() {
    console.log("Servidor Escuchando...");
})
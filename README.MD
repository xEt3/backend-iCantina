# Backend iCantina

* Server Port : `3000` tcp
* Base de datos oficial: `mongodb://localhost:27017/iPost`
* Base de datos testing: `mongodb://localhost:27017/testiPost`

## Dependencies
  * [NodeJs 12](https://nodejs.org/es/)

  * [MongoDB](https://docs.mongodb.com/manual/administration/install-community/)




## Install Node dependencies

 Nodemon: <code>npm install -g nodemon</code>
 
  Express: <code>npm install express</code>
  
   Body-parser: <code>npm install body-parser</code>
  
  Cors: <code>npm install cors</code>
  
  Mongoose: <code>npm install mongoose</code>
  
  Express-fileupload: <code>npm install express-fileupload</code>
  
  JSON Web Token: <code>npm install jsonwebtoken</code>
  
  Bcryp: <code>npm install bcrypt</code>
  
  Install all dependencies: <code>npm install express body-parser cors mongoose express-fileupload jsonwebtoken bcrypt</code>


## Init server

* ***Compile js code***:

  <code>tsc -w</code>

* ***Start mongdb server***

  <code>sudo systemctl start mongod/</code>

* ***start service***

  <code>nodemon dist/</code>


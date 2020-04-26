# Backend iCantina

* Server Port : `3000` tcp
* Oficial Data Base: `mongodb://localhost:27017/iCantina`
* Testing Data Base: `mongodb://localhost:27017/testiCantina`

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

## Install Test dependencies

 Mocha: <code>npm install -g mocha</code>
 
 Chai <code>npm install chai-http</code>
 
 ***Run test:***
 <code>mocha dist/tests</code>
 

## Init server

* ***Compile js code***:

  <code>tsc -w</code>

* ***Start mongdb server***

  <code>sudo systemctl start mongod/</code>

* ***start service***

  <code>nodemon dist/</code>


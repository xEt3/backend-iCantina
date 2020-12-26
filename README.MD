<h1>Backend iCantina</h1>

* Production Server Port : `5100` tcp
* Dev Server Port : `3000` tcp
* Production Data Base : `mongodb://localhost:27017/iCantina`
* Production Data Base (inside docker) : `mongodb://mongo:27017/iCantina`
* Dev Data Base : `mongodb://localhost:27017/testiCantina`
* Dev Data Base (inside docker) : `mongodb://mongo:27017/testiCantina`

<hr>
<br>

<h2>Development</h2>



* <h3><b>Init server</b></h3>

  * There is a docker for development, the configuration for this docker is into [docker-compose.dev.yml](docker-compose.dev.yml) and [Dockerfile-dev](Dockerfile-dev), the way to start it is with the following command:

    ```docker-compose -f docker-compose.dev.yml up --build ```
<br><br>
  * Once the docker is up, you can try to make calls to the api using this address: http://localhost:3000
<br><br>


  * To show changes on real time and acive the live reload you need install and  start typescript :


    + Install typescript: ```npm install -g typescript```

      <em> Remember that you need administrator privileges to install  npm packages globally</em>

    + Start typescript compiler on watch mood: ```tsc -w```

*  <h3><b>Run tests</b></h3>

    To run tests you need to run ```npm test``` from local machine.
    Also you can run test into docker shell, for this you need to change value of **database_ip** variable to **database_ip_docker** into [config.ts](config.ts) file, this variable contains the database address used on tests.

<br><hr><br>
<h2>Production</h2>

* <h3><b>Init server</b></h3>

  * There is a docker for production, the configuration for this docker is into [docker-compose.yml](docker-compose.yml) and [Dockerfile](Dockerfile), the way to start it is with the following command:

    ```docker-compose up --build```
<br><br>
  * Once the docker is up, you can try to make calls to the rest api using this address: https://localhost:5100
<br><br>
* <h3><b>Config file: </b></h3>

  * There is a configuration file for production, [config-prod.ts](config-prod.ts), in this file you can configure the parameter for your rest api:

    * **isHttps**: this is a boolen to set if use https, for default is true and use my cert files, you need to change [privkey.pem](privkey.pem), [cert.pem](cert.pem) and [chain.pem](chain.pem) files to your certificates files for enable https and make it works.

    * **oauth2Credentials**: this object contains the parameter to configure google authentication, for default you have mi api credentials, be carreful :wink: .
  <br><br>
* <h3><b>Docker settings: </b></h3>

  * You can configure docker settings into [docker-compose.yml](docker-compose.yml) and [Dockerfile](Dockerfile) files:

    * There are 2 volumes created to save the persistant data , one for the product images and other for the database, the default path for them is:
      *  Product images: ```/opt/iCantina/product_img/uploads```
      *  Database: ```/opt/iCantina/product_img/uploads```

       To configure them you can do it on [docker-compose.yml](docker-compose.yml) **if the indicated paths not exist it will not work**


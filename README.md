## REACT FRONTEND
cd movieApp/react/frontend
## Install dependencies
npm install

npm install axios

npm install react-router-dom

## Start the development server
npm run dev
##Springboot Backend(new terminal)
cd movieApp/backend/sign

## Copy the example secrets file
cp src/main/resources/application-secrets.properties.example src/main/resources/application-secrets.properties

## Edit the secrets file:
 Set your local MySQL username/password
Use demo TMDB API key: c00fef1812945b25eabedb6a6062341d

## Create the MySQL database
CREATE DATABASE signup;


mvn clean install -DskipTests
mvn spring-boot:run


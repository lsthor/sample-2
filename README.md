##README

Instructions
Need to have the following tools installed to run the application
- node v15.14.0 ( or nvm )
- yarn

Steps to run
1. If you are using `nvm`, you can type `nvm use` or `nvm install` to install the required npm. Or use `npm` directly
   (run `node -v` to check the version)
2. Install yarn globally by running 
`npm i -g yarn`
3. Run `yarn install` to install dependencies.
4. Duplicate `.env.example` and rename the new file to `.env`
5. Update the values in `.env` file (refer to following sections for what the variables do)
6. Run the apps `yarn start:dev`

Variables in `.env` file

- `POPULATE_CHARACTERS_INTERVAL` the interval to retrieve characters data from remote api
- `PORT` the port number to run the app
- `API_DOMAIN` remote API domain
- `PUBLIC_KEY` public key from developer account
- `PRIVATE_KEY` private key from developer account



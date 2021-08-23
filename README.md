##README

Instructions

Need to have the following tools installed to run the application
```
- node v15.14.0 ( or nvm )
- yarn
```

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

- `POPULATE_CHARACTERS_INTERVAL` the interval to retrieve characters data from remote api (in seconds)
- `PORT` the port number to run the app
- `API_DOMAIN` remote API domain
- `PUBLIC_KEY` public key from developer account
- `PRIVATE_KEY` private key from developer account

Run test case
`yarn test` or 

`yarn test:cov` for test with coverage

How we cache?
======
There are 2 main parts of caching components, loader and reader

Loader
- Loader (in `character.module.ts` and `character.task.ts`) is run the first time when the application starts and before receiving any request. 
- Loader will call remote api to fetch the data and put into the cache.
- Once the first load is done, a function will be executed periodically based on the configuration `POPULATE_CHARACTERS_INTERVA:`
- If there are new data, loader will overwrite the previously cached data with new one
- If loader encounters error when calling remote api, it will not do anything to the cached data.

Reader
- Reader will read from cache when receiving api call

Pros and cons of this design

Pros
- response is always fast
- failure from remote api doesn't affect client from calling api
- won't be hitting remote api everytime client calling api

Cons
- takes longer to startup
- if first load failed, will be unable to serve data to client (first load can be fixed by replacing it with a persistent storage, like Redis or Database)
- at the moment only loading the first 100, can be easily modified to load whole set of data but again, slow start up time
- eventual consistency due to data is fetched periodically

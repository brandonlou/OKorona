# OKorona

### How to run locally

1. Install [Node.js](https://nodejs.org/en/). Verify you have node and npm installed by running `node -v` and `npm -v`.
2. Clone this repository with `git clone https://github.com/brandonlou/OKorona.git`.
3. `cd OKorona`
3. Run `npm run build` to automatically install server and client dependencies.
4. Run this webapp locally by running `npm start` from the project root.

### How to run on Heroku
1. Install Heroku CLI.
2. Soon to come...

### Notes
* If you want to add a node module, remember to use the `--save` flag so `npm` updates the `package.json` and `package-lock.json` files accordingly. If you want to add developer dependencies, use the `--save-dev` flag.
* To only run the Node.js server locally, run `npm run server` from the project root.
* Similarly, to only run the React client server locally, run `npm run client` from the project root.
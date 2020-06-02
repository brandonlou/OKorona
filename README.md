# OKorona

OKorona is an all(well, most)-in-one resources map for pandemic situations like COVID-19.
It displays foodbanks, testing locations and stores around the user's location on a map-based Graphical User Interface.

As of now, only locations in the United States are supported.

App Features:

* Autocomplete search to get resource information at a particular location.
* Option to upvote/downvote resources to rate a particular resource's reliability.
* Google Maps Add-on - Users have the option to open Google Maps to get directions to a particular resource.
* Option to add a resource found by the user, although for security/verification purposes, this will require the creation of an account.
* Sign-up and login for users to personalize their experience

### Sources of Data

OKorona sources its data from crowd-sourced APIs. Although, the authenticity of all resources is not guaranteed, the sources we have used are reliable for the most part.

* Foodbank Locations: [Feeding America](https://www.feedingamerica.org/find-your-local-foodbank)
* Testing Centers: [Postman COVID-19 APIs](https://covid-19-apis.postman.com/covid-19-testing-locations/)
* Stores: 

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
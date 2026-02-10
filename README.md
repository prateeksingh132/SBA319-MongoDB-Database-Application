# SBA 319: MongoDB Database Application

## Project: GadgetShack (Database Layer)

**Brief Description:**
I decided to continue with my "GadgetShack" theme (from my previous SBA 307, 308A, 318 projects); my plan is to have it as my final capstone project. In the previous SBA 318, i created the backend with a mock database using arrays. In this SBA, i have finally replaced those arrays with a real **MongoDB Database**.

My goal was to replicate the same features (Products, Users, Reviews) but make them persistent and strict with data validation.

# Technology Used

* **Node.js and Express:** 
* **MongoDB:** 
* **Mongoose:** ODM (object data modeling) library i used to interact with mongodb. i used it for schemas, models, and validations.
* **JavaScript:** i used `async/await` heavily because database calls are asynchrnous.
* **Dayjs:** its a third party library for cool time formatting.
* **File System (fs):** for my view logic
* **Method-Override:** this allows my html forms to send `PATCH` and `DELETE` requests. similar to sba 318
* **CSS:** i reused my styling theme from **SBA 318** to keep the blue and orange look consistent.

# Features and Requirement List

I checked the requirement list one by one and implemented them in my code:

1.  **Three Data Collections:**
    * I converted my old data.js (from sba 318) arrays into mongoose schemas. I created 3 models in the `models/` folder: `User`, `Product`, and `Review`.
    * **Users:** it stores member info.
    * **Products:** it stores the gadgets. i used a `Map` type for `specs` so i can store different specs for laptops vs phones.
    * **Reviews:** this links a user to a product. In SBA 318 i just matched ids manually in a for loop, now mongoose does it for me.

2.  **Reasonable Data Modeling:**
    * I used `mongoose.Schema.ObjectId` and `ref` in my `Review.js` model. The thinking was that i needed some way to "populate" the data later,  such that when i look up a review, i can see exactly which user wrote it and which product it is for.

3.  **CRUD Routes (GET, POST, PATCH, DELETE):**
    * I updated my `productController.js` from sba 318 (which used array methods), to use mongoose methods:
        * `GET` : `getAllProducts` uses `find()` and `getUserProfile` uses `find({ user: id })`.
        * `POST` : `createProduct` uses `Product.create()`.
        * `PATCH` : `updateProduct` uses `findByIdAndUpdate()`. Note: I found out i have to pass {runValidators: true} or else it ignores the validation.
        * `DELETE` : `deleteProduct` uses `findByIdAndDelete()`.

4.  **Indexes:**
    * I added sensible indexes in `Product.js`.
    * `price`: i added an index on price to make sorting faster.
    * `name` and `description`: i want to implement a search bar later (FTUREWORK), thats why i added a text index
    * `compound index`: I wanted to make sure a user cannot review the same product twice. earlier, i tried to do this with an if-check in the controller, but then i found out mongoose can do it with a unique compound index on user + product.

5.  **Data Validation:**
    * I tried to add a lot of validations in my schemas:
        * **Enum:** `category` can only be specific values (laptops, audio, etc).
        * **Regex:** `email` in `User.js` must match a real email pattern.
        * **Min/Max:** ratings must be between 1-5, and price cannot be negative.
        * **Required:** important fields like name and price are required.

# View & Client Interaction

My goal in this sba in regards to view was show some stats at the top of the page and of course show product cards, users, reviews and add new gadget form. I used my SBA 318 views and added some new features. Simlar to sba 318, i wrote a simple logic in server.js using fs.readFile. it reads index.html and replaces placeholders like #content# and #title# with dynamic data.


* **HTML and CSS:** I used the same CSS file from SBA 318 to keep consistency. The theme is dark blue and orange.
* **Forms & Buttons:** Similar to sba 318, but now it saves to mongodb.
    * **Add Form:** at the bottom of the dashboard, there is a form to add new gadgets. It uses `POST` method.
    * **Edit Button:** each product card has an edit link. clicking this sends a `GET` request to `/products/:id/edit`, wich opens up the edit-form.
    * **Delete Button:** simialr to sba 318, the delete button uses the method-override trick (wrapping it in a POST form) to send a DELETE request. 
* **New Dashboard (Aggregation):**
    * This is the new addition to my product page. I added a "stats banner" at the top of the page whcih shows dynamic stats; the numbers (total value, top category). these are calculated live by mongodb using an **Aggregation Pipeline** (`$group`, `$sum`).
* **Community Section:**
    * i added a section to the dashboard that lists all "Community Members" similar to previous sba- i made their usernames clickable links that take you to their specific profile page.
* **Recent Reviews Section:**
    * Similarly, i also added a section at the bottom of the dashboard to display the latest reviews. it takes the data from the reviews collection and uses populate() method to show the specific username and product name for each review.
* **User Profile View:**
    * Another new addition, i created a new dynamic view for users information. if you go to a user's url, it shows their join date and a list of every review they have written, it takes data from both the user and review collections.

# How to Use the Application

Here is a guide on how to use the different pages and features:

1.  **Installation:**
    * run `npm install` to install dependencies.
    * create a `.env` file with your `MONGO_URI`.
    * run `npm run seed` to fill the database with starter data.
    * run `npm start` and go to `http://localhost:3000`.

2.  **The Shop Page (Dashboard):**
    * go to `http://localhost:3000/products`.
    * **View Stats:** look at the top banner to see the total inventory value and the most popular category.
    * **View Products:** scroll down to see all of the product cards. each card shows the image, price, stock, and specific specs (like cpu, battery etc).
    * **Community Members:** scroll to the bottom to see a list of registered users. click on any name to view their profile.
    * **Recent Reviews:** scroll to the bottom to see the users reviews.
    * **Filter:** you can add `?category=laptops` to the url to only see laptops.

3.  **Managing Products (CRUD):**
    * **Create (Adding a New Gadget):**
        * scroll to the bottom of the dashboard to find the "Add New Gadget" form.
        * **Required Fields:** name and price are mandatory.
        * **Category:** select from the dropdown.
        * **Specs Input:** enter the specs in JSON string format because i stored specs as a map in mongodb.
        * **Example for specs:** `{"Color": "Black", "Warranty": "1 Year"}`
        * *Note: be sure to use double quotes `"` for both keys and values in the specs field.*
    * **Update:** click the edit link on any product card. change the price or stock in the form and click "Update".
    * **Delete:** click the red delete button on a card to remove it from the database permanently.

4.  **Viewing User Profiles:**
    * go to `http://localhost:3000/products/user/[UserID]`. (or click a name in the community member section on view).
    * (you can copy a userid from the seed data or compass).
    * this page will show you the user's role, email, and a history of all the reviews they have written for the products.

# API References (Usage with Postman)

If you want to test the raw API endpoints without the HTML view, here is the reference:

| Method | Endpoint | Description | Body (JSON) |
| :--- | :--- | :--- | :--- |
| **GET** | `/products` | fetches all products. supports query param `?category=laptops`. | N/A |
| **POST** | `/products` | creates a new product. | `{ "name": "New Gadget", "price": 100... }` |
| **GET** | `/products/user/:userId` | fetches a user profile and their reviews. | N/A |
| **GET** | `/products/:id/edit` | returns the edit form for a specific product. | N/A |
| **PATCH** | `/products/:id` | updates a product's details. | `{ "price": 999 }` |
| **DELETE** | `/products/:id` | deletes a product from the database. | N/A |

# Bonus Objectives

* **Use Mongoose:** I used mongoose for the entrie application (schemas, models, queries) instead of the native mongodb.


# Testing

I have created (and used during code creation) test points (log statement) at multiple places in the code, I have not removed them. They are commented at the time of submission and can be uncommented for future debugging and code check. These code checks looks something like:


////////////TESTING

//console.log('TESTING: assignment: ', assignment);

////////////


# Reflection

**What could you have done differently during the planning stages?**

i think i should have started with planning the data relationships first. it took me a lot of time and effort to figure out how to link reviews to users and products. initially, i tried embedding the reviews inside the product schema, but then i decided to make it a separate collection so i can query it easier later (like getting all reviews by one user).

**Were there any requirements that were difficult to implement?**

the aggregation pipeline for the dashboard stats was hard to wrap my head around initially. i refered some examples on stackoverflow to get some ideas. also the `async/await` logic was a bit tricky compared to synchronous array methods i used in sba 318. i missed puting `await` before some mongoose call (like `Product.find()`) which returned a query object instead of the actual data.   

**What would you add to or change about your application if given more time?**

right now, when i add a product using the form, its just anonymous. if i had more time, i would implement real authentication (login/signup) so i can save the actual userid of the person who created the product. i also want to add a search bar that utilizes the text indexes i created.

**Use this space to make notes for your future self:**

* make sure to run the seed script (`npm run seed`) if the database gets messy or empty.
* remember that `findByIdAndUpdate` needs `{runValidators: true}` option if i want the rules (like enum or min price) to apply during updates. by default it doesnt check!
* also keep the models separate from controllers to keep things clean.

# References

I referred to some examples on stackoverflow, mongodb documentations and others to help me with the logic. Here are the links:

https://stackoverflow.com/questions/24863388/mongodb-sum-the-product-of-two-fields

https://stackoverflow.com/questions/22195065/how-to-send-a-json-object-using-html-form-data

https://stackoverflow.com/questions/36228599/how-to-use-mongoose-model-schema-with-dynamic-keys

https://www.geeksforgeeks.org/mongodb/mongoose-populate-method/

https://stackoverflow.com/questions/25214624/how-to-define-a-foreign-key-using-mongoose

https://stackoverflow.com/questions/13850819/can-i-determine-if-a-string-is-a-mongodb-objectid



I also used mongoose and mongodb documentations: 

1) https://mongoosejs.com/docs/schematypes.html#maps
2) https://mongoosejs.com/docs/populate.html
3) https://www.mongodb.com/docs/manual/core/index-unique/#unique-compound-index


# TinyApp Project
TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly but not as good!). This application was made for educational purpose.

---
### Updates
* Feature Updates
  * Added url data to '/urls/show'
  * list of visitors
  * total clicks of visitor
  * date last clicked
* Fixed bugs:
  * sending multiple response header
  * adds multiple clicks per visit
  * adds multiple visitor per click

### Future Updates?
* improve user tracking


---
## Getting Started
* Install all dependencies using "npm install" command.
* Run the development web server using the "node express_server.js" command.
* By default server is set to listen to PORT 8080. run [http://localhost:8080/](http://localhost:8080/) on your web browser.
---
## Final Product
---
### Sign In Page
!["Sign in page for TinyApp"](https://github.com/amuliawijaya23/tinyapp/blob/main/docs/tinyapp_signin.png?raw=true)
Created a sign in page, takes either email or user id. 
Users who are not logged in will be redirected to this page when trying to access the URLs page. 
Logged in users will be redirected to their myURLs page when trying to access the sign in page.

---
### Sign Up Page
!["Sign Up page for TinyApp"](https://github.com/amuliawijaya23/tinyapp/blob/main/docs/tinyapp_register.png?raw=true)
Created a sign up page to register users and allow user to set their own user id.
Users who are not logged in will be redirected to this page when trying to access the URLs page. 
Logged in users will be redirected to their myURLs page when trying to access the sign in page.

---
### URLs page
!["TinyApp URLs page"](https://github.com/amuliawijaya23/tinyapp/blob/main/docs/tinyapp_urls_new.png?raw=true)
Created a URLs page that shows individual user's URL list and track the number of clicks/visits and unique visitors. User can edit or delete their url/s by clicking edit or delete button.

---
### New URL
!["TinyApp Create New URL"](https://github.com/amuliawijaya23/tinyapp/blob/main/docs/tinyapp_validateurl1_new.png?raw=true)

!["TinyApp Create New URL validator"](https://github.com/amuliawijaya23/tinyapp/blob/main/docs/tinyapp_validateurl2.png?raw=true)

Logged in users can create new tiny URL, also add their URLs at the bottom.

After URL is submitted, validator will check if the urls is valid, then the app will add "http://" if missing as shown above.

---




## Dependencies
* Node.js
* Express
* EJS
* bcrypt
* body-parser
* cookie-session
* morgan
* validator

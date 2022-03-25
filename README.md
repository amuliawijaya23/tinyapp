# TinyApp Project
TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly but not as good!). This application was made for educational purpose.

## Final Product
### Sign In Page
!["Sign in page for TinyApp"](https://github.com/amuliawijaya23/tinyapp/blob/main/docs/tinyapp_signin.png?raw=true)
Created a sign in page, users who are not logged in will be redirected to this page when trying to access the URLs page.

### Sign Up Page
!["Sign Up page for TinyApp"](https://github.com/amuliawijaya23/tinyapp/blob/main/docs/tinyapp_register.png?raw=true)
Created a sign up page to register users and allow user to set their own user id.

### URLs page
!["TinyApp URLs page"](https://github.com/amuliawijaya23/tinyapp/blob/main/docs/tinyapp_urls_new.png?raw=true)
Created a URLs page that shows logged in user's URL and track the number of clicks and unique clicks (visitors)

### New URL
!["TinyApp Create New URL"](https://github.com/amuliawijaya23/tinyapp/blob/main/docs/tinyapp_validateurl1_new.png?raw=true)
Logged in users can create tiny URL, also add existing URLs in the bottom. Additionally this will validate the URL entered and add http:// if it is missing from the URL as shown below.

!["TinyApp Create New URL validator"](https://github.com/amuliawijaya23/tinyapp/blob/main/docs/tinyapp_validateurl2.png?raw=true)





### Dependencies
* Node.js
* Express
* EJS
* bcrypt
* body-parser
* cookie-session

## Getting Started
* Install all dependencies using "npm install" command.
* Run the development web server using the "node express_server.js" command.
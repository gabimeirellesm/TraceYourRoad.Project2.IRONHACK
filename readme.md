# Project Name

<!-- TRACKING TRAVELS -->

COLOR YOUR ROAD 
<br>

## Description

A platform where the users can register the countries where they have traveled to while being able to add photos of the trip, comments and favorites. All that while keeping track of the number of countries and percentage of the world visited.

<br>

## User Stories

- **404** - As a user I want to see a nice 404 page when I go to a page that doesn’t exist so that I know it was my fault
- **500** - As a user I want to see a nice error page when the super team screws it up so that I know that is not my fault
- **homepage** - As a user I want to be able to access the homepage and filter by type of restaurant, log in and sign up.
- **sign up** - As a user I want to sign up on the web page so that I can add favorite restaurants to my list.
- **login** - As a user I want to be able to log in on the web page so that I can get back to my account
- **logout** - As a user I want to be able to log out from the web page so that I can make sure no one will access my account
- **countries list** - As a user I want to see the list of my visited countries.
- **edit list** - As a user I want to be able to write more details about my trips and edit them if I want to and uplaod or remove photos.
- **edit user** - As a user I want to be able to edit my profile.
- **result** - As a user I want to see the number of countries that I have visited and also the percentage of the world that I know.
  <br>

## Server Routes (Back-end):

| **Method** | **Route**                          | **Description**                                                          | Request - Body                                           |
| ---------- | ---------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------- |
| `GET`      | `/`                                | Main page route. Renders home `index` view.                              |                                                          |
| `GET`      | `/login`                           | Renders `login` form view.                                               |                                                          |
| `POST`     | `/login`                           | Sends Login form data to the server.                                     | { email, password }                                      |
| `GET`      | `/signup`                          | Renders `signup` form view.                                              |                                                          |
| `POST`     | `/signup`                          | Sends Sign Up info to the server and creates user in the DB.             | { email, password }                                      |
| `GET`      | `/private/edit-profile`            | Private route. Renders `edit-profile` form view.                         |                                                          |
| `PUT`      | `/private/edit-profile`            | Private route. Sends edit-profile info to server and updates user in DB. | { email, password, [firstName], [lastName], [imageUrl] } |
| `GET`      | `/private/favorites`               | Private route. Render the `favorites` view.                              |                                                          |
| `POST`     | `/private/favorites/`              | Private route. Adds a new favorite for the current user.                 | { name, cuisine, city, }                                 |
| `DELETE`   | `/private/favorites/:restaurantId` | Private route. Deletes the existing favorite from the current user.      |                                                          |
| `GET`      | `/restaurants`                     | Renders `restaurant-list` view.                                          |                                                          |
| `GET`      | `/restaurants/details/:id`         | Renders `restaurant-details` view for the particular restaurant.         |                                                          |

## Models

User model

```javascript
{
  name: String,
  email: String,
  password: String,
  favorites: [FavoriteId],
}

```

Favorites model

```javascript
{
  placeId: String,
}

```

<br>

## API's

<br>

## Packages

<br>

## Backlog

[See the Trello board.](https://trello.com/b/Ni3giVKf/ironhackproject)

<br>

## Links

### Git

The url to your repository and to your deployed project

[Repository Link]()

[Deploy Link]()

<br>

### Slides

The url to your presentation slides

[Slides Link](https://docs.google.com/presentation/d/1P5FIi0vHZBUcgUtmt1M4_lLCO5dwdJ4UOgtJa4ehGfk/edit?usp=sharing)

### Contributors

FirstName LastName - [`<github-username>`](https://github.com/person1-username) - [`<linkedin-profile-link>`](https://www.linkedin.com/in/person1-username)

FirstName LastName - [`<github-username>`](https://github.com/person2-username) - [`<linkedin-profile-link>`](https://www.linkedin.com/in/person2-username)

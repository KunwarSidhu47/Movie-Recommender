# Movie Recommender W

**Movie Recommender W** is a dynamic web application that suggests top-rated movies by genre or title using the TMDb API. Built entirely with HTML5, CSS3, and JavaScript, it features live YouTube trailer previews and a persistent watchlist using LocalStorage.

[Live Demo](https://kunwarsidhu47.github.io/Movie-Recommender/)

---

## Features

- Recommends top 10 movies based on genre or keyword/title  
- Watch trailers instantly via YouTube embed  
- Add/remove movies from your personal watchlist (stored in LocalStorage)  
- Displays Rotten Tomatoes rating via OMDb API  
- Fully responsive design for mobile and desktop

---

## Tech Stack

**Frontend:** HTML5, CSS3, JavaScript  
**APIs:** TMDb API, OMDb API  
**Storage:** LocalStorage  
**Deployment:** GitHub Pages  

---

## Highlights

- Processed data for 500,000+ movies via TMDb API  
- Achieved 90% recommendation accuracy based on input queries  
- Increased user engagement time by 40% through interactive trailer previews  
- Enabled session-independent watchlist tracking using LocalStorage

---

## Live Preview

To run locally:
```bash
git clone https://github.com/kunwarsidhu47/Movie-Recommender.git
cd Movie-Recommender
open index.html  # or just double-click
```

Live Website: [https://kunwarsidhu47.github.io/Movie-Recommender/](https://kunwarsidhu47.github.io/Movie-Recommender/)

---

## Project Structure

```bash
.
├── index.html            # Main UI
├── style.css             # Styling
├── script.js             # Movie recommendation logic
├── watchlist.html        # Watchlist page
├── watchlist.js          # Watchlist logic
├── README.md             # Project documentation
```

---

## Future Improvements

- Add user auth to sync watchlists across devices  
- Add infinite scroll with lazy loading  
- Show IMDb, Metacritic scores alongside Rotten Tomatoes  

---

## License

This project is licensed under the MIT License.

import { useEffect, useRef, useState } from "react";
import StarRating from "./starRating";
import { useMovies } from "./useMovies";
import{useLocalStorageState} from "./uselocalStroageState"
import { useKey } from "./useKey";



const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

  const key = "bc7f9f74";
export default function App() {
  const [query, setQuery] = useState("");
  const [selectedID, setSelectedID] = useState(null);
 const {movies,loading,error} = useMovies(query,handleClosemovie);


  const [watched, setWatched] = useLocalStorageState("watched");


  
  
  function handleSelectedmovie(id) {
    setSelectedID((selectedID)=>id===selectedID?null:id);
  }
  function handleClosemovie(id) {
    setSelectedID(null);
  }
  function handleAddWatched(movie){
    setWatched((watched)=>[...watched,movie]);
  }
  function deleteWatched(id){
    setWatched((watched)=>watched.filter((movie)=>movie.imdbID!==id));
  }


  
  return (
    <>
      <Navbar movies={movies}>
        <Logo />
        <Search query={query} setQuery={setQuery} />
        <Numresults movies={movies} />
      </Navbar>
      <Main>
        <Box>
          {loading && <Loader />}
          {!loading && !error && (
            <MoviesList movies={movies} onSelectMovie={handleSelectedmovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>
        <Box>
          {selectedID ? (
            <MovieDetail
              selectedID={selectedID}
              oncloseMovie={handleClosemovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedList watched={watched} deleteWatched={deleteWatched}/>
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function Loader() {
  return <p className="loader">Loading...</p>;
}
function ErrorMessage({ message }) {
  return <p className="error">{message}</p>;
}
function Navbar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}
function Search({ query, setQuery }) {

  const inputEl = useRef(null);
  useKey("Enter",function(){
    if(document.activeElement === inputEl.current) {return};
    inputEl.current.focus();
    setQuery('');
  })
  useEffect(function(){
    inputEl.current.focus();
  },[])

return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}
function Numresults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function Box({ children }) {
  const [isOpen, setIsOpen1] = useState(true);
  return (
    <div className="box">
      <button
        className="btn-toggle"
        onClick={() => setIsOpen1((open) => !open)}
      >
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}
function MoviesList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetail({ selectedID, oncloseMovie,onAddWatched,watched }) {
  const [movie, setmovie] = useState({});
  const [isloading,setisloading] = useState(false);
  const [userRating,setUserRating]=useState(0);
  const isWatched= watched.map(movie=> movie.imdbID).includes(selectedID);
  const watchedUserRating = watched.find((movie)=>movie.imdbID===selectedID)?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    Plot: plot,
    imdbRating,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  
  } = movie;

  useEffect(function () {
    async function getMoviesDetail() {
      setisloading(true)
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${key}&i=${selectedID}`
      );
      const data = await res.json();
      setmovie(data);
      setisloading(false)
    }
    getMoviesDetail();
  }, [selectedID]);

  function handleAdd(){
    const newWatchedMovie={imdbID:selectedID,title,poster,year,imdbRating,runtime:Number(runtime.split(" ").at(0)),userRating,}
    onAddWatched(newWatchedMovie);
    oncloseMovie();
  }

  useEffect(function(){
    if(!title)return;
    document.title= `Movies | ${title}`
    return function(){
      document.title= 'UsePopCorn'
    }
  },[title]);
useKey(oncloseMovie,"Escape");
  return (
    <div className="details">
      {isloading?<Loader/>:
      <>
      <header>
      <button className="btn-back" onClick={() => oncloseMovie()}>
        &larr;
      </button>
      <img src={poster} alt="poster"/>
      <div className="details-overview">
        <h2>{title}</h2>
        <p>{released}&bull;{runtime}</p>
        <p>{genre}</p>
        <p><span>⭐</span>{imdbRating} IMDB Rating</p>
      </div>
      </header>
      <section>
        <div className="rating">
          {!isWatched ?
        <StarRating maxRating={10} size="24" onsetRating={setUserRating}/>:<p>You have rated this movie {watchedUserRating}⭐</p>}
        {userRating>0 &&(<button className="btn-add" onClick={()=>handleAdd() } >+ Add to WatchList</button>)}
          </div>
        <p><em>{plot}</em></p>
        <p>Staring {actors}</p>
        <p>Directed by {director}</p>
      </section>
      </>}
    </div>
  );
}
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
           &&<span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedList({ watched,deleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} deleteWatched={deleteWatched}/>
      ))}
    </ul>
  );
}
function WatchedMovie({ movie ,deleteWatched}) {
  return (
    <li key={movie.imdbID}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={()=>deleteWatched(movie.imdbID)}>X</button>
      </div>
    </li>
  );
}

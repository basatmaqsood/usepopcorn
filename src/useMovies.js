import { useState,useEffect } from "react";


export function useMovies(query,callback){;
    const key = "bc7f9f74";
    const [loading, setloading] = useState(false);
    const [error, seterror] = useState("");
    const [movies, setMovies] = useState([]);
useEffect(

    function () {
      const controller = new AbortController();
      async function fetchMovies() {
        try {
          setloading(true);
          seterror("");
          const res = await fetch(
            `https://www.omdbapi.com/?i=tt3896198&apikey=${key}&s=${query}`,{signal:controller.signal}
          );
          const data = await res.json();
          if (data.Response === "False") {
            
            throw new Error("No Movie found");
          }
          setMovies(data.Search);
          
          if (!res.ok) {
            throw new Error("Something went wrong while fetching data");
          }
        } catch (err) {
          if(err.name !== "AbortError"){
            seterror(err.message);
          }
        } finally {
          setloading(false);
        }
      }
      if (query.length < 3) {
        setMovies([]);
        seterror("");
        return;
      }
    //   handleClosemovie();
    callback?.();
      fetchMovies();
      return function(){
        controller.abort();
      }
    },
    [query]
  );
  return{movies,loading,error}
}

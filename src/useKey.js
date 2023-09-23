import { useEffect } from "react";
export function useKey(keycode,oncloseMovie){
    useEffect(function(){
    
        function callback(e){
          if(e.code === keycode){
            oncloseMovie();
          }
        }
        document.addEventListener('keydown',callback)
        return function(){
          document.removeEventListener("keydown",callback);
        }
      },[oncloseMovie,keycode])
}
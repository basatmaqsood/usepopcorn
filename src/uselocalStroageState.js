import { useState,useEffect } from "react";
export function useLocalStorageState(key){
    const [value, setvalue] = useState(function(){
    const storedValue = localStorage.getItem(key);
    console.log(storedValue);
    return JSON.parse(storedValue) || [] ;
  });
  useEffect(function(){
    localStorage.setItem(key,JSON.stringify(value));
  },[value,key])
  return [value,setvalue];
};
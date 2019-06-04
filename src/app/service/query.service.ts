import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class QueryService {

  constructor() { }
  movieName;
  setMovieName(movieName: string){
    this.movieName = movieName;
  }
  getMovieName(){
    return this.movieName;
  }
}

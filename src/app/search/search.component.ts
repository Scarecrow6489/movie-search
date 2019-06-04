import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  constructor(private _router: Router){}

  movieName: string;

  ngOnInit() {
  }

  getRelatedMovies(){
    console.log(this.movieName);
    
    if(this.movieName){
      this._router.navigate(['result']);
    }
    else {
      alert('Enter Movie Name to Search');
    }
  }
  
}

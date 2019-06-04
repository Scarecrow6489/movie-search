import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SearchComponent } from '../search/search.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {

  constructor(private _http: HttpClient, private _search: SearchComponent,
    private _router: Router) { }

  result: any[];

  ngOnInit() {
    var query = 'sketch'; //this._search.movieName;
    if(!query){
      this._router.navigate(['search']);
    }
    console.log(query);
    
    var possibilities = []
    this._http.get<any>('../../assets/movies.json').subscribe(res => {
      res.forEach(movie => {
        var title =  movie['Movie Name'].toLowerCase()
        var distance = this.getLevenshteinDistance(query.toLowerCase(), title);
        if(((distance / query.length) < .5) || distance == title.length-query.length){
          possibilities.push([movie, distance/query.length]);
        }
      });
      this.result = possibilities.sort((a,b) => {
        return Number(a[1]) - Number(b[1]);
      }).slice(1, 10);
      console.log(this.result);
    })
  }

  getLevenshteinDistance(a,b){
    if(a.length == 0) return b.length; 
    if(b.length == 0) return a.length; 
  
    var matrix = [];
  
    var i;
    for(i = 0; i <= b.length; i++){
      matrix[i] = [i];
    }
  
    var j;
    for(j = 0; j <= a.length; j++){
      matrix[0][j] = j;
    }
  
    // Fill in the rest of the matrix
    for(i = 1; i <= b.length; i++){
      for(j = 1; j <= a.length; j++){
        if(b.charAt(i-1) == a.charAt(j-1)){
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(matrix[i-1][j-1] + 1,
                                  Math.min(matrix[i][j-1] + 1,
                                           matrix[i-1][j] + 1));
        }
      }
    }
  
    return matrix[b.length][a.length];
  }
}

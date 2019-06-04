import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { QueryService } from '../service/query.service';
@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css']
})
export class ResultComponent implements OnInit {

  constructor(
    private _http: HttpClient,
    private _query: QueryService,
    private _router: Router) { }

  result: any[];
  query: string;
  ngOnInit() {
    
    this.query = this._query.getMovieName();
    if(!this.query){
      this._router.navigate(['search']);
    }
    console.log(this.query);
    
    var possibilities = []
    this._http.get<any>('../../assets/movies.json').subscribe(res => {
      res.forEach(movie => {
        var title =  movie['Movie Name'].toLowerCase()
        var distance = this.ld(this.query.toLowerCase(), title);
        if(((distance / this.query.length) < .4) || distance == title.length-this.query.length){
          possibilities.push([movie, distance/this.query.length]);
        }
      });
      console.log(possibilities);
      
      this.result = possibilities.sort((a,b) => {
        return Number(a[1]) - Number(b[1]);
      }).slice(0, 10);
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
  ld(a, b) {
    // Create empty edit distance matrix for all possible modifications of
    // substrings of a to substrings of b.
    const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  
    // Fill the first row of the matrix.
    // If this is first row then we're transforming empty string to a.
    // In this case the number of transformations equals to size of a substring.
    for (let i = 0; i <= a.length; i += 1) {
      distanceMatrix[0][i] = i;
    }
  
    // Fill the first column of the matrix.
    // If this is first column then we're transforming empty string to b.
    // In this case the number of transformations equals to size of b substring.
    for (let j = 0; j <= b.length; j += 1) {
      distanceMatrix[j][0] = j;
    }
  
    for (let j = 1; j <= b.length; j += 1) {
      for (let i = 1; i <= a.length; i += 1) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        distanceMatrix[j][i] = Math.min(
          distanceMatrix[j][i - 1] + 1, // deletion
          distanceMatrix[j - 1][i] + 1, // insertion
          distanceMatrix[j - 1][i - 1] + indicator, // substitution
        );
      }
    }
  
    return distanceMatrix[b.length][a.length];
  }
}

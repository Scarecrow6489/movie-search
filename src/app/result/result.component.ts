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
  jaro_winkler = {
    distance: 0,
    adjustments: 0,
    weight: 0
  };

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
        var distance = this.jaro_winklerdistance(this.query.toLowerCase(), title);
        if((distance > .7)){
          possibilities.push([movie, distance]);
        }
      });
      console.log(possibilities);
      this.result = possibilities.sort((a,b) => {
        return Number(a[1]) - Number(b[1]);
      }).reverse().slice(0, 10);
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
  jaro_winklerdistance(a, b) {

    if (!a || !b) { return 0.0; }
  
    a = a.trim().toUpperCase();
    b = b.trim().toUpperCase();
    var a_len = a.length;
    var b_len = b.length;
    var a_flag = []; var b_flag = [];
    var search_range = Math.floor(Math.max(a_len, b_len) / 2) - 1;
    var minv = Math.min(a_len, b_len);
  
    // Looking only within the search range, count and flag the matched pairs. 
    var Num_com = 0;
    var yl1 = b_len - 1;
    for (var i = 0; i < a_len; i++) {
      var lowlim = (i >= search_range) ? i - search_range : 0;
      var hilim  = ((i + search_range) <= yl1) ? (i + search_range) : yl1;
      for (var j = lowlim; j <= hilim; j++) {
        if (b_flag[j] !== 1 && a[j] === b[i]) {
          a_flag[j] = 1;
          b_flag[i] = 1;
          Num_com++;
          break;
        }
      }
    }
  
    // Return if no characters in common
    if (Num_com === 0) { return 0.0; }
  
    // Count the number of transpositions
    var k = 0; var N_trans = 0;
    for (var i = 0; i < a_len; i++) {
      if (a_flag[i] === 1) {
        var j: number;
        for (j = k; j < b_len; j++) {
          if (b_flag[j] === 1) {
            k = j + 1;
            break;
          }
        }
        if (a[i] !== b[j]) { N_trans++; }
      }
    }
    N_trans = Math.floor(N_trans / 2);
  
    // Adjust for similarities in nonmatched characters
    var N_simi = 0; var adjwt = this.jaro_winkler.adjustments;
    if (minv > Num_com) {
      for (var i = 0; i < a_len; i++) {
        if (!a_flag[i]) {
          for (var j = 0; j < b_len; j++) {
            if (!b_flag[j]) {
              if (adjwt[a[i]] === b[j]) {
                N_simi += 3;
                b_flag[j] = 2;
                break;
              }
            }
          }
        }
      }
    }
  
    var Num_sim = (N_simi / 10.0) + Num_com;
  
    // Main weight computation
    var weight = Num_sim / a_len + Num_sim / b_len + (Num_com - N_trans) / Num_com;
    weight = weight / 3;
  
    // Continue to boost the weight if the strings are similar
    if (weight > 0.7) {
      // Adjust for having up to the first 4 characters in common
      var j = (minv >= 4) ? 4 : minv;
      var i: number;
      for (i = 0; (i < j) && a[i] === b[i]; i++) { }
      if (i) { weight += i * 0.1 * (1.0 - weight) };
  
      // Adjust for long strings.
      // After agreeing beginning chars, at least two more must agree
      // and the agreeing characters must be more than half of the
      // remaining characters.
      if (minv > 4 && Num_com > i + 1 && 2 * Num_com >= minv + i) {
        weight += (1 - weight) * ((Num_com - i - 1) / (a_len * b_len - i*2 + 2));
      }
    }
    return weight
  };
}

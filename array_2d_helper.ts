// array_2d_helper.ts

export function a2d_diff(a:any,b:any) {
   console.log("+++a2d_diff");
   const x_size = a.length;
   const y_size = a[0].length;
   //TODO how is length info put in this
   let ret = new Array(x_size).fill(false).map(() => new Array(y_size).fill(false));
   let line = "";
   for(let x = 0; x < x_size; ++x) {
      for(let y = 0; y < y_size; ++y) {
         ret[x][y] = (a[x][y] == b[x][y]);
         line += `${a[x][y] === b[x][y]} `         
         //console.log(x, y, a[x][y], b[x][y], ret[x][y]);
      }
      line += "\n";
   }
   //console.log("..........................................");
   //console.log(line);
   //console.log("..........................................");
   //a2d_print(ret);
   return ret;
}

export function a2d_print(arr:any) {
   arr.forEach( row => console.log(row.map( cell => (cell === true) ? 1 : 0)))
}
